import { nanoid } from "nanoid";

const types = ["Ordinaire", "Relatif", "Absolu"];
class Client {
    constructor(type, duréeService, tempsArrivée) {
        this.id = nanoid(5);
        this.type = type;
        this.duréeService = duréeService;
        this.tempsArrivée = tempsArrivée;
    }

    get typeString() {
        return types[this.type];
    }
}

export { Client };
