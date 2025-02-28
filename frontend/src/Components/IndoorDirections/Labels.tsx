import { Label, useMap } from "@mappedin/react-sdk";

export default function Labels() {
  const { mapData } = useMap();

  if (!mapData) return null;

  return (
    <>
      {mapData.getByType("space").map((space, idx) => (
        <Label
          key={idx}
          target={space.center}
          text={space.name}
          options={{
            interactive: true,
            appearance: {
              marker: { foregroundColor: { active: "tomato" } },
              text: { foregroundColor: "tomato" },
            },
          }}
        />
      ))}
    </>
  );
}
