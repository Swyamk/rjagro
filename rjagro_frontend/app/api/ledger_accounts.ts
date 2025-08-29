import { LedgerAccount, LedgerAccountPayload } from "../types/interfaces";
import api from "../utils/api";
import { toast } from "react-toastify";

export const fetchLedgerAccounts = async (): Promise<LedgerAccount[]> => {
  const response = await api.get("/getall/ledger_accounts");
  return response.data;
};

export const handleAddLedgerAccount = async (
  payload: LedgerAccountPayload,
  queryClient: any,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void
) => {
  if (
    !payload.name ||
    !payload.account_type ||
    payload.current_balance === undefined ||
    payload.current_balance === null
  ) {
    toast.error("Please fill in all required fields");
    return;
  }

  setLoading(true);
  toast.info("Adding ledger account...");

  try {
    await api.post("/insert/ledger_account", payload);

    queryClient.invalidateQueries(["ledger_accounts"]);

    toast.success("Ledger account added successfully!");
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error adding ledger account:", error);
    toast.error("Error adding ledger account");
  } finally {
    setLoading(false);
  }
};

export const handleUpdateLedgerAccount = async (
  accountId: number,
  payload: Partial<LedgerAccountPayload>,
  queryClient?: any
) => {
  try {
    await api.put(`/update/ledger_accounts/${accountId}`, payload);
    toast.success(`Account #${accountId} updated successfully!`);

    queryClient?.invalidateQueries(["ledger_accounts"]);
  } catch (error) {
    console.error("Error updating ledger account:", error);
    toast.error("Error updating ledger account");
  }
};

export const handleDeleteLedgerAccount = async (
  accountId: number,
  queryClient?: any
) => {
  try {
    await api.delete(`/delete/ledger_accounts/${accountId}`);
    toast.success(`Account #${accountId} deleted successfully!`);

    queryClient?.invalidateQueries(["ledger_accounts"]);
  } catch (error) {
    console.error("Error deleting ledger account:", error);
    toast.error("Error deleting ledger account");
  }
};
