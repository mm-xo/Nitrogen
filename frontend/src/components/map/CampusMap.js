import { HtmlMap } from "./HtmlMap";
import { NativeMap } from "./NativeMap";
import { MAP_ENGINE } from "./mapEngine";

// Same props and ref API ({ focus, showCampus }) whichever engine is picked.
export const CampusMap = MAP_ENGINE === "maplibre" ? HtmlMap : NativeMap;
