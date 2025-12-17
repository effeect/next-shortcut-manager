// This file will sort out the imports for the fontawesome icons we need

import { config, library } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS

import { faSteam } from "@fortawesome/free-brands-svg-icons";
import { faGamepad, faDiceD20 } from "@fortawesome/free-solid-svg-icons";

config.autoAddCss = false;

// Add the librayr below
library.add(faSteam, faGamepad, faDiceD20);
