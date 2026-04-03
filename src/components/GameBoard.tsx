import boardImg from "../../assets/board.png";

export function GameBoard() {
  return (
    <img
      src={boardImg}
      alt="Wingspan game board"
      className="rounded-lg shadow-lg"
      style={{ height: "calc(100vh - 340px)", objectFit: "contain" }}
      draggable={false}
    />
  );
}
