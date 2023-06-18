const downloadJSON = (notes) => {
  const dataStr =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
  const dlAnchorElem = document.getElementById("downloadAnchorElem");
  if (dlAnchorElem) {
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "Notes.json");
    dlAnchorElem.click();
  }
};

export default downloadJSON;
