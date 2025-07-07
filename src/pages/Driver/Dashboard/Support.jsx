import { useState, useEffect } from "react";

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [issue, setIssue] = useState("");
  const [faqList, setFaqList] = useState([]);

  useEffect(() => {
    // Dummy initial tickets
    setTickets([
      {
        id: 1,
        issue: "Can't accept ride requests",
        status: "Open",
        createdAt: "2025-07-05",
      },
      {
        id: 2,
        issue: "App not loading properly",
        status: "Resolved",
        createdAt: "2025-07-03",
      },
    ]);

    // Dummy FAQs for drivers
    setFaqList([
      {
        id: 1,
        question: "How do I accept ride requests?",
        answer: "Make sure you’re online, and tap 'Accept' when a request appears.",
      },
      {
        id: 2,
        question: "How do I update my vehicle information?",
        answer: "Go to Profile > Vehicle Info and edit your vehicle details.",
      },
    ]);
  }, []);

  const submitTicket = () => {
    if (!issue.trim()) return alert("Please describe your issue.");
    const newTicket = {
      id: Date.now(),
      issue,
      status: "Open",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setTickets([newTicket, ...tickets]);
    setIssue("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">Driver Support Center</h1>

      {/* Submit Ticket */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Submit a Support Ticket</h2>
        <textarea
          rows="4"
          placeholder="Describe your issue..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
        />
        <button
          onClick={submitTicket}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Submit Ticket
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Tickets</h2>
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets submitted yet.</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="border border-gray-200 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">{ticket.issue}</p>
                  <p className="text-sm text-gray-500">Submitted: {ticket.createdAt}</p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    ticket.status === "Open"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {ticket.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqList.map((faq) => (
            <div key={faq.id} className="border-b pb-4">
              <p className="font-medium text-gray-800">{faq.question}</p>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
