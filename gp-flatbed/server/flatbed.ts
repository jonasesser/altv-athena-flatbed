import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { GP_Events_Flatbed } from '../shared/events';
import { ITow } from '../shared/iTow';

/**
 * A tow
 */
class Tow implements ITow {
    /**
     * The flatbed vehicle
     */
    flatbed: alt.Vehicle;

    /**
     * The towed vehicle
     */
    towed: alt.Vehicle;

    constructor(flatbed: alt.Vehicle, towed: alt.Vehicle) {
        this.flatbed = flatbed;
        this.towed = towed;
    }
}

let tows: Tow[] = [];

export class gpFlatbed {
    static init() {
        alt.onClient(GP_Events_Flatbed.RemoveTow, gpFlatbed.removeTow);
        alt.onClient(GP_Events_Flatbed.AddTow, gpFlatbed.addTow);
        alt.onClient(GP_Events_Flatbed.GetTowedVehiclesList, gpFlatbed.getTowedVehiclesList);
        alt.onClient(GP_Events_Flatbed.GetVehiclesList, gpFlatbed.getVehiclesList);
    }

    static async removeTow(player: alt.Player, thistow: Tow) {
        let temptows = [];
        tows.forEach(async (tow) => {
            if (tow.flatbed != thistow.flatbed) {
                temptows.push(tow);
            } else {
                //Save new position
                await Athena.vehicle.controls.update(thistow.towed);
                // VehicleFuncs.save(thistow.towed, {
                //     position: thistow.towed.pos,
                //     rotation: thistow.towed.rot,
                // });

                //Reset netOwner for towed vehicle
                thistow.towed.resetNetOwner();
            }
        });
        tows = temptows;
    }

    static addTow(player: alt.Player, flatbed: alt.Vehicle, towed: alt.Vehicle) {
        tows.push(new Tow(flatbed, towed));
        //Set netOwner
        towed.setNetOwner(player);
    }

    static getTowedVehiclesList(player: alt.Player) {
        alt.emitClient(player, GP_Events_Flatbed.SendTowedVehiclesList, tows);
    }

    static getVehiclesList(player: alt.Player) {
        let list = alt.Vehicle.all;
        alt.emitClient(player, GP_Events_Flatbed.SendVehiclesList, list);
    }
}
