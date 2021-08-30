import {Document, Packer, Paragraph, TextRun} from 'docx';
import {saveAs}     from 'file-saver';
import storage      from '../storages/commonStorage';

export default function exportDocx (textRows) {
    storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'warn', message: 'Идёт сохранение документа...'})

    const doc = new Document();
    let rows = [];

    try {
        for (let text of textRows) {
            rows.push(
                // Size is 50% of MS Word pts
                new Paragraph({ children: [new TextRun({text: `${text}`, size: "24", font: "Arial"})] })
            );
        }

        doc.addSection({ children: rows })
        
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "SMISPlan document.docx");
            storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'success', message: 'Документ успешно сохранён и загружен'})
        });
    }
    catch (err) {
        storage.alert.dispatch({ type: 'SHOW_ALERT', status: 'fail', message: 'Ошибка при создании и/или сохранении'})
        console.log(`Ошибка при сохранении и/или создании документа: ${err}`)
    }

    return true;
}