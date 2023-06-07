/*global chrome*/
import "./Tabs.scss";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { downloadJSON, downloadXLSX } from "../../utils/downloadNotes";

import NotesContext from "../../context/notesContext";
import SidePanel from "../SidePanel/SidePanel";
import arrowLeft from "../../assets/arrow-previous-left.svg";
import hamburger from "../../assets/hamburger.svg";
import verticalDot from "../../assets/vertical_dots.svg";

function Tabs({ onSidePanelToggle }) {
  const {
    themes,
    activeTheme,
    setActiveTheme,
    folders,
    activeFolder,
    closeTab,
    activeNoteId,
    setActiveNoteId,
    addNote,
    setFolders,
  } = useContext(NotesContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [maxLimit, setMaxLimit] = useState(0);
  const [usedSpace, setUsedSpace] = useState(0);
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

  // useEffect(() => {
  //   if (chrome.storage && chrome.storage.local) {
  //     chrome.storage.local.getBytesInUse().then((value) => {
  //       setUsedSpace(value);
  //     });
  //   }
  // }, [folders]);

  useEffect(() => {
    const tabRef = tabGroup.current;
    tabRef.addEventListener("wheel", handleHorizontalScroll);
    // if (chrome.storage && chrome.storage.local) {
    //   setMaxLimit(chrome.storage.local.QUOTA_BYTES);
    // }

    return () => tabRef.removeEventListener("wheel", handleHorizontalScroll);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    handleScroll();
  }, [activeFolder, activeNoteId]);

  const handleScroll = () => {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
      activeTab.scrollIntoView();
    }
  };

  const handleDownloadXlsx = () => {
    downloadXLSX(folders);
  };

  const handleDownloadJson = () => {
    downloadJSON(folders);
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
    setFolders(jsonData);
  };

  return (
    <section className="tab__container">
      <button
        className="clickable notes-panel__toggle flex-center"
        onClick={() => setPanelOpen((toggle) => !toggle)}
      >
        <img
          style={{ height: "16px" }}
          src={panelOpen ? arrowLeft : hamburger}
          alt="3-dot"
        />
      </button>
      <div className="tab__controls">
        {" "}
        <div className="tab-group hide-scrollbar" ref={tabGroup}>
          {activeFolder &&
            activeFolder?.notes?.map((note) => (
              <button
                className={
                  "tab " +
                  (activeFolder.activeNoteId === note._id
                    ? "active"
                    : "clickable")
                }
                key={note._id}
                onClick={() => setActiveNoteId(activeFolder._id, note._id)}
                tabIndex={activeFolder.activeNoteId === note._id ? "-1" : "0"}
              >
                <div className="tab-title" title={note.title}>
                  {note.title}
                </div>
                <div
                  className="clickable tab-close flex-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(activeFolder, note._id);
                  }}
                >
                  +
                </div>
              </button>
            ))}
        </div>
        {activeFolder && (
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
          {themes.map((theme) => (
            <div
              className={
                "clickable notes-menu-item " +
                (theme === activeTheme ? "active" : "")
              }
              key={theme}
              onClick={() => {
                setActiveTheme(theme);
              }}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </div>
          ))}
          <hr />
          <h4>Storage Used</h4>
          <hr />
          <span className="notes-menu-item">
            <progress
              style={{ width: "120px" }}
              type="progress"
              max={maxLimit}
              value={usedSpace}
            ></progress>
          </span>
          <hr />
          <h4>Export As</h4>
          <hr />
          <div className="notes-menu-item export-import">
            <button
              className="export-import-button clickable"
              onClick={handleDownloadXlsx}
            >
              .xlsx
            </button>
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
            Import From{" "}
            <span style={{ padding: "0 6px" }} className="export-import-button">
              .json
            </span>
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
