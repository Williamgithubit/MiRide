import { getCarReport } from "../controllers/adminReportsController.js";

// Minimal mock of db to attach to imported module's db variable isn't straightforward since controller imports db directly.
// Instead, we run a quick static syntax check by importing the controller and calling the function with mocks for req/res.

const fakeReq = { query: { startDate: "2025-09-13", endDate: "2025-10-13" } };
const fakeRes = {
  status(code) {
    this._status = code;
    return this;
  },
  json(obj) {
    console.log("JSON response:", obj);
  },
};

(async () => {
  try {
    await getCarReport(fakeReq, fakeRes);
    console.log("Invocation complete");
  } catch (err) {
    console.error("Error when invoking getCarReport:", err);
  }
})();
