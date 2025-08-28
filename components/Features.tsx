const Features = () => {
  return (
    <section id="features" className="py-20">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Room & Tenant Tracking</h3>
            <p>Easily manage your rooms, track occupancy, and keep tenant records all in one place.</p>
          </div>
          <div className="p-8 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Rent Payment Management</h3>
            <p>Automate rent collection, send reminders, and track payment history effortlessly.</p>
          </div>
          <div className="p-8 border rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Reporting & Analytics</h3>
            <p>Gain insights into your rental business with our comprehensive financial reports.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
