export interface DeliveryCredentials {
  apiId: string;
  apiToken: string;
}

export interface CreateShipmentInput {
  orderNumber: string;
  customerFirstName: string;
  customerLastName: string;
  phone: string;
  address: string;
  fromWilayaName: string;
  toWilayaName: string;
  toCommuneName: string;
  productLabel: string;
  codAmount: number;
  isStopDesk: boolean;
  stopDeskId?: number | null;
}

export interface CreateShipmentResult {
  trackingNumber: string;
  raw: unknown;
}

export interface DeliveryProvider {
  /** Company name as stored in the DeliveryCompany table — used to route to this provider. */
  companyName: string;
  testConnection(credentials: DeliveryCredentials): Promise<boolean>;
  createShipment(credentials: DeliveryCredentials, input: CreateShipmentInput): Promise<CreateShipmentResult>;
}
