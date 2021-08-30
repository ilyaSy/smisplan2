import moment from 'moment';
import { metaData, dataTable } from '../config/data';

export default function getDefaultValues (id, property, metaTable, mode = 'defaultValue') {
  const today = new Date();
  let value;
  switch (metaTable[property][mode]) {
    case 'date':
      value = moment(today, 'YYYY-MM-DD').format('YYYY-MM-DD');
      break;
    case 'time':
      value = moment(today, 'YYYY-MM-DD').format('HH:mm:00');
      break;
    case 'datetime':
      value = moment(today, 'YYYY-MM-DD').format('YYYY-MM-DD HH:mm:00');
      break;
    case 'empty':
      value = undefined;
      break;
    default:
      if ( metaTable[property][mode].search(/object:/) !== -1 ) {
        const inputData = metaTable[property][mode].split(',');
        const objectKey = inputData[0].split(':')[1];
        const objectValue = inputData[1].split(':')[1];
        if ( objectKey === 'data' ) {
          value = dataTable[ id ][ objectValue ]
        } else if ( objectKey === 'meta' ) {
          value = metaData[ objectValue ]
        }
      }
      else{
        value = metaTable[property][mode];
      }

      break;
  }

  return value;
}
