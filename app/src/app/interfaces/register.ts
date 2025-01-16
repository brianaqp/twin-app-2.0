// TODO: Cambiar el modelo de datos para que sea más entendible, y tenga mas sentido con
// la logica de la aplicacion.
export interface Register {
  timestamp: Date;
  workingPorts: string[];
  _id: string;
  id: string;
  registerCount: number;
  vesselId: string;
  flow: string;
  vesselTrips: string;
  loadingPort: string;
  totalShipment: string;
  cargo: string;
  portCalls: PortCalls[];
  stowagePlan: {
    data: Hold[];
    totales: object[];
  };
  calados: Calados[];
  destinatarios: Destinatario[];
  reports: {
    [portName: string]: {
      times: Times;
      data: GeneralData;
      quantities: Quantities;
      holdCargos: HoldCargos[];
    };
  };
  nominacionInterna: {
    attn: string;
    cliente: string;
    direccion: string;
    direccionCuenta: string;
  };
}

export interface GeneralData {
  products: string[];
  receiversData: {
    receivers: Recibidor[];
    total: string;
  };
  blData: {
    data: BlObject[];
    ttl: {
      weight: string;
      scale: string;
      diff: string;
    };
  };
  showTable: boolean;
  showGeneralQtt: boolean;
  showReceiversQtt: boolean;
  showProductsQtt: boolean;
  showHoldsQtt: boolean;
  generalRemarks: string;
  masterRemarks: string;
  norPresented: string;
  norTendered: string;
  signatures: SignBox[];
  manualTable: QuantitieTtl;
}

interface SignBox {
  name: string;
  role: string;
}

interface Hold {
  hold: string;
  cargo: string;
  general: string;
  [port: string]: string;
}

export interface Recibidor {
  id: string;
  name: string;
  razonSocial: string;
  agenteAduanal: string;
  tonelaje: string;
  producto: string;
  terminal: string;
}

export interface BlObject {
  id: string;
  cargo: string;
  bl: string;
  weight: string;
  scale: string;
  diff: string;
}

export interface Times {
  [date: string]: {
    arrivalTimes: TimesObject[];
    stopTimes: TimesObject[];
    operationalTimes: TimesObject[];
    sailingTimes: TimesObject[];
  };
}

export interface TimesObject {
  startTime: string;
  endTime: string;
  description: string;
  category: string;
}

export interface Quantities {
  [date: string]: {
    receivers: {
      data: QuantitiesObject[];
      ttl: QuantitieTtl;
    };
    holds: {
      data: QuantitiesObject[];
      ttl: QuantitieTtl;
    };
    products: {
      data: QuantitiesObject[];
      ttl: QuantitieTtl;
    };
    general: QuantitieTtl;
  };
}

export interface HoldCargos {
  hold: string;
  cargo: string;
}

export interface QuantitiesObject {
  [name: string]: string;
  initialTon: string;
  previous: string;
  perDay: string;
  ttl: string;
  toBeDischarge: string;
}

export interface InitialQuantitie {
  name: string;
  tonelaje: string;
}

export interface QuantitieTtl {
  initialTon: string;
  previous: string;
  perDay: string;
  ttl: string;
  toBeDischarge: string;
}

interface Destinatario {
  companie: string;
  names: string[];
  role: string;
}

interface PortCalls {
  port: string;
  cantidad: string;
}

interface Calados {
  port: string;
  foreward: string;
  afterward: string;
}
