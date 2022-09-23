import {assocSuite} from "./assoc.js";
import {getSuite} from "./get.js";
import {deleteSuite} from "./delete.js";
import {singleKeyDifference,
    allKeysDifference} from "./difference.js";

assocSuite.run();
getSuite.run();
deleteSuite.run();
singleKeyDifference.run();
allKeysDifference.run();
