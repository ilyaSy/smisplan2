export default function TblCell({ headCell, value, fullTextIcon, zoomLink, youTubeLink }) {
  return (
    <>
      {headCell.isInlineEditable && headCell.type === 'string' && (
        <>
          {fullTextIcon}
          {zoomLink}
          {youTubeLink}
          {value}
        </>
      )}

      {!headCell.isInlineEditable && !['multi-select', 'select'].includes(headCell.type) && (
        <>
          {fullTextIcon}
          {value}
        </>
      )}

      {/* Select non-editable cell value */}
      {!headCell.isInlineEditable && headCell.type === 'select' && <>{value}</>}

      {/* Multi-select non-editable cell value */}
      {!headCell.isInlineEditable && headCell.type === 'multi-select' && (
        <div className="data-table__cell-multiselect">{value}</div>
      )}
    </>
  );
}
