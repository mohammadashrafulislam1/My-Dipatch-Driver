import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../Components/useAuth";
import { endPoint } from "../../../Components/ForAPIs";

const Support = () => {
  const { user, loading } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [issue, setIssue] = useState("");
  const [faqList, setFaqList] = useState([]);
  const [userType, setUserType] = useState("driver"); 
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState("");

  // Decide if this is driver or customer support from logged-in user
  useEffect(() => {
    if (!loading && user) {
      // Adjust this line if your field is different (e.g. user.type)
      const type = user.role === "driver" ? "driver" : "customer";
      setUserType(type);
    }
  }, [user, loading]);

  // Fetch tickets + FAQs from backend
  useEffect(() => {
    const fetchSupportData = async () => {
      if (!user || loading) return;

      try {
        setIsLoadingPage(true);
        setError("");

        // /support/driver OR /support/customer
        const res = await axios.get(
          `${endPoint}/support/${userType}`,
          { withCredentials: true }
        );

        // Backend returns: { tickets, faqs, userType } :contentReference[oaicite:2]{index=2}
        setTickets(res.data.tickets || []);
        setFaqList(res.data.faqs || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load support data. Please try again.");
      } finally {
        setIsLoadingPage(false);
      }
    };

    fetchSupportData();
  }, [userType, user, loading]);

  // Create ticket via backend
  const submitTicket = async () => {
    if (!issue.trim()) {
      alert("Please describe your issue.");
      return;
    }

    try {
      setError("");

      // /support/ticket/driver OR /support/ticket/customer
      const res = await axios.post(
        `${endPoint}/support/ticket/${userType}`,
        { issue },
        { withCredentials: true }
      );

      // Backend returns { message, ticket } :contentReference[oaicite:3]{index=3}
      const newTicket = res.data.ticket;

      // Put new ticket at top of list
      setTickets((prev) => [newTicket, ...prev]);
      setIssue("");
      alert("Ticket created successfully.");
    } catch (err) {
      console.error(err);
      setError("Failed to create ticket. Please try again.");
    }
  };

  const headingText =
    userType === "driver" ? "Driver Support Center" : "Customer Support Center";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">{headingText}</h1>

      {error && (
        <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Submit Ticket */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Submit a Support Ticket
        </h2>
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
          disabled={loading || isLoadingPage}
        >
          {loading || isLoadingPage ? "Please wait..." : "Submit Ticket"}
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Tickets</h2>
        {isLoadingPage ? (
          <p className="text-gray-500">Loading your tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-500">No tickets submitted yet.</p>
        ) : (
          <ul className="space-y-4">
            {tickets.map((ticket) => (
              <li
                key={ticket._id || ticket.id}
                className="border border-gray-200 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {ticket.issue}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted:{" "}
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    (ticket.status || "").toLowerCase() === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {ticket.status || "Open"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Frequently Asked Questions
        </h2>
        {isLoadingPage ? (
          <p className="text-gray-500">Loading FAQs...</p>
        ) : faqList.length === 0 ? (
          <p className="text-gray-500">No FAQs available.</p>
        ) : (
          <div className="space-y-4">
            {faqList.map((faq) => (
              <div key={faq._id || faq.id} className="border-b pb-4">
                <p className="font-medium text-gray-800">{faq.question}</p>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;
