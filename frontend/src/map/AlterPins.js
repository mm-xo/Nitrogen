import { backend } from "../data";

export async function getAlertCoordinates() {
  return backend.alerts.list();
}

export async function getAlerts() {
  return backend.alerts.list();
}

export async function getMyAlerts(userId) {
  if (!userId) return [];
  return backend.alerts.listByUser(userId);
}

export async function deleteAlert(alertId) {
  return backend.alerts.remove(alertId);
}
