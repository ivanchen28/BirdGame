import { iconUrl } from "../icons";

interface ActionCubeProps {
  color: string;
  size: number;
}

export const ActionCube: React.FC<ActionCubeProps> = ({ color, size }) => {
  const iconSize = size * 0.7;
  return (
    <div
      className="flex items-center justify-center rounded-full drop-shadow-lg shrink-0"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        backgroundColor: color,
        border: "2px solid #c4b9ad",
      }}
    >
      <img
        src={iconUrl("action_cube")}
        alt="action cube"
        style={{
          width: iconSize,
          height: iconSize,
          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))",
        }}
      />
    </div>
  );
};
