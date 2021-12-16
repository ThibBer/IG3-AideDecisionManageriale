import { nanoid } from "nanoid";

class Client {
    constructor(type, duréeService, tempsArrivée) {
        this.id = nanoid(5);
        this.type = type;
        this.duréeService = duréeService;
        this.tempsArrivée = tempsArrivée;
    }
}

export { Client };
