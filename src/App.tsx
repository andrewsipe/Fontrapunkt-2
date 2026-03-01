/**
 * Fontrapunkt 2.0 — App entry
 * Single route: AppProviders > DropZone (fp2) > Fontrapunkt2Layout.
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppProviders } from "./AppProviders";
import { Fontrapunkt2Layout } from "./components/fp2";
import { DropZone } from "./components/fp2/DropZone/DropZone";
import { PaletteViewerPage } from "./pages/PaletteViewerPage";
import { StyleMatrixPage } from "./pages/StyleMatrixPage";
import { useUIStore } from "./stores/uiStore";
import "./App.css";

function Fontrapunkt2Route() {
  const viewMode = useUIStore((state) => state.viewMode);
  const isPresentMode = viewMode === "present";

  return (
    <AppProviders>
      <DropZone>
        <Fontrapunkt2Layout isPresentMode={isPresentMode} />
      </DropZone>
    </AppProviders>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Fontrapunkt2Route />} />
        <Route
          path="/palette"
          element={
            <AppProviders>
              <PaletteViewerPage />
            </AppProviders>
          }
        />
        <Route
          path="/style-matrix"
          element={
            <AppProviders>
              <StyleMatrixPage />
            </AppProviders>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
