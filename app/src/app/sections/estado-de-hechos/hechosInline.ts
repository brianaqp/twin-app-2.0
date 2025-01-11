import { LocalColors } from "src/app/utils/variables";

export class HechosInlineStyles {
  colorStyles = LocalColors;
  maxWidth = '215mm';

  table = {
    'border-collapse': 'collapse',
    'border-spacing': '0',
    border: '1px solid black',
  };

  title = {
    padding: '10px',
    'margin-bottom': '20px',
    border: 'none',
  };

  fullWidth = {
    width: this.maxWidth,
    'max-width': this.maxWidth,
    'min-width': this.maxWidth,
  };
  // General Cell
  cell = {
    'min-height': '25px !important',
    'max-height': '25px !important',
    height: '25px !important',
    margin: '1px',
    padding: '3px',
    'padding-left': '8px',
    border: '1px solid black',
  };
  // Ship Particulars
  sp = {
    th: {
      'background-color': this.colorStyles.middle,
      color: 'white',
      width: '50% !important',
      'min-width': '50% !important',
      'max-width': '50% !important',
      'font-weight': '600',
    },
    td: {
      'font-weight': 'normal',
      width: '50% !important',
      'min-width': '50% !important',
      'max-width': '50% !important',
      'text-transform': 'uppercase',
    },
  };
  // Receivers
  rec = {
    header: {
      th: {
        'font-size': '19px',
        'font-weight': '600',
        color: 'white',
        'background-color': this.colorStyles.middle,
      },
    },
    body: {
      th: {
        'background-color': this.colorStyles.middleMore,
        width: '75% !important',
        'font-weight': 'normal',
      },
      td: {
        'vertical-align': 'middle',
      },
    },
    foot: {
      th: {
        'background-color': this.colorStyles.soft,
        color: 'black',
        'font-weight': '400',
      },
      td: {},
    },
  };

  // Times fullWidths styles and extends for the header, category and body
  times = {
    header: {
      th: {
        'background-color': this.colorStyles.middle,
        color: 'white',
      },
      date: {
        'background-color': this.colorStyles.middleMore,
      },
      category: {
        'background-color': this.colorStyles.soft,
      },
    },
  };

  // Signatures boxes
  sign = {
    box: {
      width: '47.5%',
      border: 'none',
      'margin-bottom:': '20px',
    },
    header: {
      'background-color': this.colorStyles.middle,
      color: 'white',
      height: '45px',
      'text-align': 'center',
      border: '1px solid black',
    },
    body: {
      'background-color': 'white',
      height: '140px',
      border: '1px solid black',
    },
    foot: {
      'background-color': this.colorStyles.softer,
      height: '45px',
      'text-align': 'center',
      border: '1px solid black',
    },
  };

  // Tabla de recibidores con sus bls
  bl = {
    header: {
      th: {
        'background-color': this.colorStyles.middle,
        color: 'white',
        'font-weight': '600',
      },
    },
    footer: {
      td: {
        'background-color': this.colorStyles.softer,
        color: 'black',
        'font-weight': '400',
      },
    },
    emptyCell: {
      'background-color': this.colorStyles.middleMore,
    },
  };

  remarks = {
    pre: {
      'white-space': 'pre-wrap',
      'font-family': 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    },
  };

  border = {
    none: {
      border: 'none',
    },
  };

  // Metodo que combina los estilos de multiples objetos para crear uno solo
  // gms -> getMergedStyles
  gms(...args: any): any {
    return Object.assign({}, ...args);
  }
}
