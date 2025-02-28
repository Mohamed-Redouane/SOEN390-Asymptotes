import { useEvent, useMap } from "@mappedin/react-sdk";

export default function ClickNavigation({ accessible }) {
  const { mapView, mapData } = useMap();

  useEvent("click", async (event) => {
    if (!mapView || !mapData) return;

    const clickedLocation = event.coordinate;
    const destination = mapData.getByType("space").find((s) => s.name === "H110");

    if (destination) {
      try {
        const directions = await mapView.getDirections(clickedLocation, destination, {
          accessible,
        });

        if (directions) {
          mapView.Navigation.draw(directions, {
            pathOptions: {
              nearRadius: 1,
              farRadius: 1,
              color: accessible ? "green" : "blue",
            },
          });
        } else {
          console.warn("No navigable path found!");
        }
      } catch (error) {
        console.error("Error generating directions:", error);
      }
    }
  });

  return null;
}
