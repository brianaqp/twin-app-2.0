export interface Vessel {
  id: string;
  shipParticulars: {
    name: string;
    flag: string;
    imo: string;
    callSign: string;
    dwt: string;
    built: string;
    beam: string;
    loa: string;
    grt: string;
    nrt: string;
    hH: string;
    cranes: string;
  };
  registers: string[];
}
