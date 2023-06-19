import "./Tabs.scss";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import NotesContext from "../../context/notesContext";
import SidePanel from "../SidePanel/SidePanel";
import downloadJSON from "../../utils/downloadNotes";
import hamburger from "../../assets/hamburger.svg";
import verticalDot from "../../assets/vertical_dots.svg";

function Tabs({ onSidePanelToggle }) {
  const {
    themes,
    activeTheme,
    setActiveTheme,
    notes,
    activeFolderId,
    closeTab,
    activeNoteId,
    setActiveNoteId,
    addNote,
    setNotes,
  } = useContext(NotesContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const tabGroup = useRef();

  useEffect(() => {
    onSidePanelToggle(panelOpen);
    // eslint-disable-next-line
  }, [panelOpen]);

  const handleHorizontalScroll = useCallback(
    (event) => {
      const tabRef = tabGroup.current;

      const toLeft = event.deltaY < 0 && tabRef.scrollLeft > 0;
      const toRight =
        event.deltaY > 0 &&
        tabRef.scrollLeft < tabRef.scrollWidth - tabRef.clientWidth;

      if (toLeft || toRight) {
        event.preventDefault();
        tabGroup.current.scrollLeft += event.deltaY;
      }
    },
    [tabGroup]
  );

  useEffect(() => {
    const tabRef = tabGroup.current;
    tabRef.addEventListener("wheel", handleHorizontalScroll);

    return () => tabRef.removeEventListener("wheel", handleHorizontalScroll);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    handleScroll();
  }, [activeFolderId, activeNoteId]);

  const handleScroll = () => {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
      activeTab.scrollIntoView();
    }
  };

  const handleDownloadJson = () => {
    downloadJSON(notes);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = handleFileRead;
    reader.readAsText(file);
  };

  const handleFileRead = (e) => {
    const content = e.target.result;
    const jsonData = JSON.parse(content);
    setNotes(jsonData);
  };

  return (
    <section className="tab__container">
      <button
        className="clickable notes-panel__toggle flex-center"
        style={{ display: panelOpen ? "none" : "block" }}
        onClick={() => setPanelOpen((toggle) => !toggle)}
      >
        <img style={{ height: "16px" }} src={hamburger} alt="hamburger" />
      </button>
      <div className="tab__controls">
        {" "}
        <div className="tab-group hide-scrollbar" ref={tabGroup}>
          {activeFolderId &&
            notes[activeFolderId]?.list?.map((note) => (
              <button
                className={
                  "tab " +
                  (notes[activeFolderId].activeNoteId === note.id
                    ? "active"
                    : "clickable")
                }
                key={note.id}
                onClick={() => setActiveNoteId(activeFolderId, note.id)}
                tabIndex={
                  notes[activeFolderId].activeNoteId === note.id ? "-1" : "0"
                }
              >
                <div className="tab-title" title={note.title}>
                  {note.title}
                </div>
                <div
                  className="clickable tab-close flex-center"
                  onClick={(event) => {
                    event.stopPropagation();

                    if (
                      window.confirm(
                        "Are you sure you want to delete the notes? You will not be able to undo this action"
                      )
                    ) {
                      closeTab(activeFolderId, note.id);
                    }
                  }}
                >
                  +
                </div>
              </button>
            ))}
        </div>
        {activeFolderId && (
          <button className="clickable tab-add flex-center" onClick={addNote}>
            +
          </button>
        )}
      </div>
      <button
        className="clickable notes-menu__toggle flex-center"
        onClick={() => setMenuOpen(true)}
      >
        <img style={{ height: "16px" }} src={verticalDot} alt="3-dot" />
      </button>
      <div
        className={"notes-menu__overlay " + (menuOpen ? "visible" : "")}
        onClick={() => setMenuOpen(false)}
      >
        <div
          className="notes-menu"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <h4>Choose Theme</h4>
          <hr />
          <div className="notes-menu-item color-palette-list">
            {themes.map((theme) => (
              <div
                className={
                  "color-palette clickable " +
                  (activeTheme === theme ? "active" : "")
                }
                key={theme}
                onClick={() => {
                  setActiveTheme(theme);
                }}
              >
                <div className={"color-slice secondary theme " + theme}></div>
                <div className={"color-slice primary theme " + theme}></div>
              </div>
            ))}
          </div>
          <hr />
          <h4>Export As</h4>
          <hr />
          <div className="notes-menu-item export-import">
            <button
              className="export-import-button clickable"
              onClick={handleDownloadJson}
            >
              .json
            </button>
            <a id="downloadAnchorElem" style={{ display: "none" }} href="/#">
              Download
            </a>
          </div>
          <hr />
          <h4>
            Import From <code>.json</code>
          </h4>
          <hr />
          <div className="notes-menu-item export-import">
            <input type="file" accept=".json" onChange={handleFileChange} />
          </div>
        </div>
      </div>
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </section>
  );
}

export default Tabs;
