import WastePicker from "@/features/waste/components/waste-picker.client";

export default function WastePage() {
  return (
    <main className="container">
      <h1>Müllabfuhr</h1>
      <p>Region: BAV · Stadt: Wermelskirchen</p>
      <WastePicker />
    </main>
  );
}
