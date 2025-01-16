// StylingVariables
const softer = '#e8f2f3';
const middle = '#328A92';
const soft = '#CEEAED';

const cellStyles = {
  // Font
  'font-family': 'Tahoma',
  // Border
  'border-color': 'black',
  border: '1px solid black',
  // Padding
  'min-height': '25px',
  'max-height': '25px',
  height: '25px',
  margin: '1px',
  padding: '3px',
};

const cellSmallWidth = {
  width: '110px',
  'min-width': '110px',
  'max-width': '110px',
};

const cellNormalWidth = {
  width: '220px',
  'min-width': '220px',
  'max-width': '220px',
};

const cellCargoWidth = {
  width: '330px',
  'min-width': '330px',
  'max-width': '330px',
};

const cellDoubleWidth = {
  width: '440px',
  'min-width': '440px',
  'max-width': '440px',
};

const cellTripleWidth = {
  width: '660px',
  'min-width': '660px',
  'max-width': '660px',
};

const tableStyles = {
  border: '1px solid black',
  'border-collapse': 'collapse',
};

export const horasInline = {
  general: {
    table: {
      ...tableStyles,
      width: '440px',
      'min-width': '440px',
      'max-width': '440px',
    },
    header: {
      ...cellStyles,
      ...cellDoubleWidth,
      'background-color': middle,
      'font-size': '16px',
      'font-weight': 'bold',
      'text-align': 'center',
      color: 'white',
    },
    body: {
      th: {
        ...cellStyles,
        ...cellNormalWidth,
        'background-color': soft,
        'text-align': 'center',
        'font-size': '13px',
      },
      td: {
        ...cellStyles,
        ...cellNormalWidth,
        'text-align': 'center',
        'font-size': '13px',
      },
    },
  },
  times: {
    table: {
      ...tableStyles,
    },
    header: {
      ...cellStyles,
      ...cellTripleWidth,
      'background-color': middle,
      'font-size': '16px',
      'font-weight': 'bold',
      'text-align': 'center',
      color: 'white',
    },
    body: {
      th: {
        ...cellStyles,
        ...cellNormalWidth,
        'background-color': soft,
        'text-align': 'center',
        'font-size': '13px',
      },
      td: {
        ...cellStyles,
        ...cellDoubleWidth,
        'text-align': 'center',
        'font-size': '13px',
      },
    },
  },
  quantities: {
    table: {
      ...tableStyles,
      width: '1045px',
    },
    header: {
      'background-color': middle,
      'text-transform': 'capitalize',
      'font-weight': 'bold',
      'text-align': 'center',
      color: 'white',
      'font-size': '16px',
    },
    body: {
      th: {
        ...cellStyles,
        ...cellNormalWidth,
        'background-color': soft,
        'text-align': 'center',
        'font-size': '13px',
      },
      td: {
        ...cellStyles,
        ...cellNormalWidth,
        'text-align': 'center',
        'font-size': '13px',
      },
    },
    footer: {
      th: {
        'background-color': softer,
        'text-align': 'center',
        'font-size': '13px',
        width: '110px',
      },
      td: {
        ...cellStyles,
        'background-color': softer,
        'text-align': 'center',
        'font-size': '13px',
      },
    },
    utils: {
      cargo: {
        ...cellStyles,
        ...cellCargoWidth,
        'text-align': 'center',
        'font-size': '13px',
      },
      hold: {
        ...cellSmallWidth,
        ...cellStyles,
        'background-color': softer,
        'text-align': 'center',
        'font-size': '13px',
      },
    },
  },
  titles: {
    'font-family': 'Tahoma',
    'font-size': '16px',
    'font-weight': 'bold',
  },
};
