// src/components/SmithTraceVisualizer/index.tsx
"use client";

import { useState, useEffect } from "react";
import { Locale } from "@/i18n/config";
import { Dictionary } from "@/i18n/types";

interface SmithTrace {
  id: string;
  run_id: string;
  parent_run_id?: string;
  project_name: string;
  session_name?: string;
  start_time?: string;
  end_time?: string;
  status: string;
  inputs?: any;
  outputs?: any;
  error?: string;
  metadata?: any;
  created_at: string;
}

interface TraceNode {
  id: string;
  parentId?: string;
  name: string;
  status: string;
  duration?: number;
  children: TraceNode[];
  inputs?: any;
  outputs?: any;
  error?: string;
  metadata?: any;
}

interface SmithTraceVisualizerProps {
  locale: Locale;
  dictionary: Dictionary;
}

export default function SmithTraceVisualizer({ locale, dictionary }: SmithTraceVisualizerProps) {
  const [traces, setTraces] = useState<SmithTrace[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [traceTree, setTraceTree] = useState<TraceNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(null);

  // Fetch trace sessions on component mount
  useEffect(() => {
    fetchTraceSessions();
  }, []);

  // Fetch trace data when session is selected
  useEffect(() => {
    if (selectedSession) {
      fetchTraceData(selectedSession);
    }
  }, [selectedSession]);

  // Build trace tree when traces change
  useEffect(() => {
    if (traces.length > 0) {
      const tree = buildTraceTree(traces);
      setTraceTree(tree);
      // Auto-expand the root node
      if (tree) {
        setExpandedNodes(new Set([tree.id]));
      }
    }
  }, [traces]);

  // Fetch trace sessions from the API
  const fetchTraceSessions = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("/api/smith/traces?project=document-extraction");
      
      if (!response.ok) {
        throw new Error("Failed to fetch trace sessions");
      }
      
      const data = await response.json();
      const sessionNames = [...new Set(data.traces.map((t: SmithTrace) => t.session_name).filter(Boolean))];
      setSessions(sessionNames);
      
      if (sessionNames.length > 0) {
        setSelectedSession(sessionNames[0]);
      }
    } catch (err) {
      console.error("Error fetching trace sessions:", err);
      setError("Failed to fetch trace sessions");
    } finally {
      setLoading(false);
    }
  };

  // Fetch trace data for a specific session
  const fetchTraceData = async (sessionName: string) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`/api/smith/traces?session=${sessionName}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch trace data");
      }
      
      const data = await response.json();
      setTraces(data.traces);
    } catch (err) {
      console.error("Error fetching trace data:", err);
      setError("Failed to fetch trace data");
    } finally {
      setLoading(false);
    }
  };

  // Build a hierarchical tree from flat trace data
  const buildTraceTree = (traces: SmithTrace[]): TraceNode | null => {
    // Create a map for quick lookup
    const traceMap = new Map<string, SmithTrace>();
    traces.forEach(trace => traceMap.set(trace.run_id, trace));
    
    // Find the root trace (no parent or parent not in our dataset)
    const rootTrace = traces.find(trace => 
      !trace.parent_run_id || !traceMap.has(trace.parent_run_id)
    );
    
    if (!rootTrace) return null;
    
    // Build the tree recursively
    const buildNode = (trace: SmithTrace): TraceNode => {
      const children: TraceNode[] = traces
        .filter(t => t.parent_run_id === trace.run_id)
        .map(buildNode);
      
      // Calculate duration if start and end times are available
      let duration: number | undefined;
      if (trace.start_time && trace.end_time) {
        const start = new Date(trace.start_time).getTime();
        const end = new Date(trace.end_time).getTime();
        duration = (end - start) / 1000; // in seconds
      }
      
      return {
        id: trace.run_id,
        parentId: trace.parent_run_id,
        name: getTraceName(trace),
        status: trace.status,
        duration,
        children,
        inputs: trace.inputs,
        outputs: trace.outputs,
        error: trace.error,
        metadata: trace.metadata
      };
    };
    
    return buildNode(rootTrace);
  };

  // Get a friendly name for a trace
  const getTraceName = (trace: SmithTrace): string => {
    // Try to get a meaningful name from metadata or inputs
    if (trace.metadata?.name) return trace.metadata.name;
    
    // If it's a model call, extract the model name
    if (trace.metadata?.model_name) return `Model: ${trace.metadata.model_name}`;
    
    // If it's a chain or tool, use that info
    if (trace.metadata?.chain_type) return `Chain: ${trace.metadata.chain_type}`;
    if (trace.metadata?.tool_name) return `Tool: ${trace.metadata.tool_name}`;
    
    // Default to run_id
    return `Trace: ${trace.run_id.slice(0, 8)}...`;
  };

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // View node details
  const viewNodeDetails = (node: TraceNode) => {
    setSelectedNode(node);
  };

  // Format time duration
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return 'N/A';
    
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    }
    
    return `${seconds.toFixed(2)}s`;
  };

  // Render a tree node
  const renderTreeNode = (node: TraceNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    
    // Determine status color
    let statusColor = 'bg-gray-200 dark:bg-gray-700';
    if (node.status === 'success') statusColor = 'bg-green-200 dark:bg-green-700';
    if (node.status === 'error') statusColor = 'bg-red-200 dark:bg-red-700';
    if (node.status === 'running') statusColor = 'bg-blue-200 dark:bg-blue-700';
    
    return (
      <div key={node.id} className="ml-4">
        <div className="flex items-center py-1">
          <div 
            style={{ marginLeft: `${depth * 16}px` }}
            className="flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded p-1"
          >
            {hasChildren && (
              <button 
                onClick={() => toggleNode(node.id)}
                className="mr-2 w-5 h-5 flex items-center justify-center text-xs"
              >
                {isExpanded ? '▼' : '►'}
              </button>
            )}
            {!hasChildren && <span className="w-5 mr-2"></span>}
            
            <span className={`w-3 h-3 rounded-full ${statusColor} mr-2`}></span>
            
            <span className="text-sm">{node.name}</span>
            
            {node.duration !== undefined && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDuration(node.duration)}
              </span>
            )}
            
            <button
              onClick={() => viewNodeDetails(node)}
              className="ml-2 text-blue-600 dark:text-blue-400 text-xs hover:underline"
            >
              Details
            </button>
          </div>
        </div>
        
        {isExpanded && node.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center h-32">
          <p className="text-gray-500 dark:text-gray-400">Loading traces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-50 dark:bg-gray-900 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Smith Trace Visualizer</h2>
      
      {/* Session selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Trace Session</label>
        <select 
          value={selectedSession || ''}
          onChange={(e) => setSelectedSession(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800"
        >
          <option value="">Select a session</option>
          {sessions.map((session) => (
            <option key={session} value={session}>
              {session}
            </option>
          ))}
        </select>
      </div>
      
      {/* Trace tree visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Trace Tree</h3>
        
        {traceTree ? (
          <div className="overflow-x-auto">
            {renderTreeNode(traceTree)}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No trace data available for this session
          </p>
        )}
      </div>
      
      {/* Node details */}
      {selectedNode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Node Details: {selectedNode.name}</h3>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Close
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status and timing */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className={`text-sm ${
                  selectedNode.status === 'success' ? 'text-green-600 dark:text-green-400' :
                  selectedNode.status === 'error' ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
              
              {selectedNode.duration !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Duration:</span>
                  <span className="text-sm">{formatDuration(selectedNode.duration)}</span>
                </div>
              )}
              
              {selectedNode.error && (
                <div>
                  <span className="text-sm font-medium">Error:</span>
                  <div className="mt-1 p-2 bg-red-50 dark:bg-red-900 rounded text-xs overflow-auto">
                    {selectedNode.error}
                  </div>
                </div>
              )}
            </div>
            
            {/* Metadata */}
            <div>
              <span className="text-sm font-medium">Metadata:</span>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto max-h-32">
                <pre>{JSON.stringify(selectedNode.metadata, null, 2)}</pre>
              </div>
            </div>
          </div>
          
          {/* Inputs and outputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <span className="text-sm font-medium">Inputs:</span>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto max-h-64">
                <pre>{JSON.stringify(selectedNode.inputs, null, 2)}</pre>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium">Outputs:</span>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto max-h-64">
                <pre>{JSON.stringify(selectedNode.outputs, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}