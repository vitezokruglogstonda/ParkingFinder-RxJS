import {
    draw
} from "./drawing";
import{createClient} from "./models/clientState";

const state = createClient();

draw(document.body);