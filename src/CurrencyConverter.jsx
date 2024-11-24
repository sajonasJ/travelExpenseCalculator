import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CurrencyConverter = () => {
  const url = "https://api.freecurrencyapi.com/v1/latest";
  const apik = "fca_live_DxVIn8pRa66prt3oaWi2pMUGpPhRRggDZOVlCW0i";
  const [fromCurrency, setFromCurrency] = useState("JPY");
  const [toCurrency, setToCurrency] = useState("AUD");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [isCurrencyLocked, setIsCurrencyLocked] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);

  const notifySuccess = () => toast.success("Cleared History successfully!");
  const notifyError = () => toast.error("Conversion failed. Please try again.");
  const notifyWarn = () => toast.warn("Please enter a valid amount.");

  const allowedCurrencies = [
    { name: "United States", code: "USD" },
    { name: "Australia", code: "AUD" },
    { name: "Japan", code: "JPY" },
    { name: "Philippines", code: "PHP" },
  ];

  // Load history from localStorage when the component mounts
  useEffect(() => {
    const loadedHistory = loadHistory();
    setHistory(loadedHistory);
    if (loadedHistory.length > 0) {
      setIsCurrencyLocked(true);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      saveHistory(history);
    }
  }, [history]);

  const convertCurrency = async () => {
    if (!amount || isNaN(amount)) {
      notifyWarn();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${url}?apikey=${apik}&currencies=${toCurrency}&base_currency=${fromCurrency}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch conversion data. Status: ${response.status}`
        );
      }

      const data = await response.json();
      const rate = data.data[toCurrency];
      const roundedRate = rate ? rate.toFixed(2) : null;
      if (!rate) {
        throw new Error(`Conversion rate for ${toCurrency} not found`);
      }

      // Store the exchange rate
      setExchangeRate(roundedRate);

      // Optional: perform the conversion if needed
      const result = (amount * rate).toFixed(2);
      const formattedResult = parseFloat(result).toLocaleString();
      setConvertedAmount(formattedResult);

      const newHistory = [
        ...history,
        {
          amount,
          fromCurrency,
          toCurrency,
          result: formattedResult,
          date: new Date().toLocaleString(),
        },
      ];
      setHistory(newHistory);
      setAmount("");
      setIsCurrencyLocked(true);
    } catch (error) {
      console.error("Error converting currency:", error);
      notifyError();
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setConvertedAmount(null);
    setAmount("");
    setIsCurrencyLocked(false);
    localStorage.removeItem("conversion_history");
    notifySuccess();
  };

  const saveHistory = (history) => {
    localStorage.setItem("conversion_history", JSON.stringify(history));
  };

  const loadHistory = () => {
    const storedHistory = localStorage.getItem("conversion_history");
    return storedHistory ? JSON.parse(storedHistory) : [];
  };

  const totalConvertedAmount = history
  .reduce((total, entry) => total + parseFloat(entry.result), 0)
  .toLocaleString();


  return (
    <>
      <div className="container-fluid">
        <div className="mt-5">
          <h1>Simple Travel Expense Calculator</h1>
        </div>
        <div className="py-4">
          <div className="my-3">
            <label className="w-75">
              Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>
          <div className="my-3">
            <label className="w-75">
              From Currency:
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                disabled={isCurrencyLocked}
              >
                {allowedCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="my-3">
            <label className="w-75">
              To Currency:
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                disabled={isCurrencyLocked}
              >
                {allowedCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="d-flex justify-content-evenly align-items-center pb-3 rounded">
          <button
            className="btn btn-primary btn-sm px-4 py-2 rounded"
            onClick={convertCurrency}
          >
            Convert
          </button>
          <button
            className="btn btn-danger btn-sm px-4 py-2 rounded"
            onClick={clearHistory}
          >
            Clear History
          </button>
        </div>

        <div className=" rounded py-2 d-flex align-items-center justify-content-center">
          {loading ? (
            <p>Loading...</p>
          ) : (
            convertedAmount && (
              <h5>
                1 {fromCurrency} = {exchangeRate} {toCurrency}
              </h5>
            )
          )}
        </div>

        <div
          className="mt-4 border p-2 rounded"
          style={{ background: "#e0e0e0" }}
        >
          <h5>Conversion History</h5>
          {history.length === 0 ? (
            <p>No history available.</p>
          ) : (
            <ul>
              {history.map((entry, index) => (
                <li key={index}>
                  {entry.amount} {entry.fromCurrency} = {entry.result}{" "}
                  {entry.toCurrency}
                </li>
              ))}
            </ul>
          )}
        </div>
        {history.length > 0 && (
          <div
            className="border mt-3  text-center rounded p-2"
            style={{ background: "#e0e0e0" }}
          >
            <h5>
              Total: {totalConvertedAmount} {toCurrency} from {fromCurrency}
            </h5>
          </div>
        )}
      </div>
    </>
  );
};

export default CurrencyConverter;
