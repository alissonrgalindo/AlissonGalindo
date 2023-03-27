import React, { useEffect, useState } from "react";
import anime from "animejs";
import styles from "./index.module.scss";

const Background = () => {
  const [toggled, setToggled] = useState(false);
  const [columns, setColumns] = useState(0);
  const [rows, setRows] = useState(0);

  const createGrid = () => {
    const size = document.body.clientWidth > 800 ? 70 : 50;
    const newColumns = Math.floor(document.body.clientWidth / size);
    const newRows = Math.floor(document.body.clientHeight / size);

    setColumns(newColumns);
    setRows(newRows);
  };

  const handleOnClick = (index) => {
    setToggled(!toggled);
    anime({
      targets: `.${styles.tile}`,
      backgroundColor: toggled ? "#000" : "#fff",
      delay: anime.stagger(50, {
        grid: [columns, rows],
        from: index,
      }),
    });
  };

  const createTile = (index) => {
    return (
      <div
        key={index}
        className={styles.tile}
        onClick={() => handleOnClick(index)}
        tabIndex={0}
      />
    );
  };

  const tiles = Array.from(Array(columns * rows)).map((tile, index) =>
    createTile(index)
  );

  useEffect(() => {
    createGrid();
    handleOnClick(0);

    window.addEventListener("resize", createGrid);
    return () => {
      window.removeEventListener("resize", createGrid);
    };
  }, []);

  return (
    <div
      className={styles.wrapper}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {tiles}
    </div>
  );
};

export default Background;
