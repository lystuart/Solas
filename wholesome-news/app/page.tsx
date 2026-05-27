import Map from "@/components/Map";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">Skip to map</a>
      <h1 className="sr-only">Solas — Good News Worldwide</h1>
      <Map />
    </>
  );
}
