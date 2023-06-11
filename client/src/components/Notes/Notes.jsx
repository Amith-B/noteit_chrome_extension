import "./Notes.scss";

import { useContext, useState } from "react";

import NotesContext from "../../context/notesContext";
import TabContent from "../TabContent/TabContent";
import Tabs from "../Tabs/Tabs";

function Notes() {
  const { activeTheme, isSaved, activeNoteId } = useContext(NotesContext);
  const [sidePanelToggle, setSidePanelToggle] = useState(false);

  return (
    <div
      className={
        "Note theme " +
        activeTheme +
        (sidePanelToggle ? " sidepanel-active" : "")
      }
    >
      <div className={"save-status " + (isSaved === 2 ? "error" : "")}>
        {isSaved === 1
          ? "Saved✔️"
          : isSaved === 0
          ? "Saving..."
          : (isSaved === 2 && "Storage Exceeded") || ""}
      </div>
      <Tabs onSidePanelToggle={setSidePanelToggle} />
      <TabContent key={activeNoteId} />
    </div>
  );
}

export default Notes;
