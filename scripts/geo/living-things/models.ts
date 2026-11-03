/** One source of specimen anatomy for baking and offline QA. */
import * as animals from './specimens/animals';
import * as plants from './specimens/plants';
import * as fungi from './specimens/fungi-bacteria';
import * as props from './specimens/non-living';
import { polishAnimal } from './specimens/animal-details';
import type { Model } from './kit';
export const MODELS:Record<string,()=>Model>={
 'toy-car':props.toyCar,pebble:props.pebble,'plastic-flower':props.plasticFlower,
 ixora:plants.ixora,'chilli-seedling':plants.chilliSeedling,'rhu-sapling':plants.rhuSapling,
 'birds-nest-fern':plants.birdsNestFern,'staghorn-fern':plants.staghornFern,moss:plants.moss,
 mushroom:fungi.mushroom,'bracket-fungus':fungi.bracketFungus,'mouldy-bread':fungi.mouldyBread,yeast:fungi.yeast,'bacteria-dish':fungi.bacteriaDish,
 grasshopper:animals.grasshopper,beetle:animals.beetle,spider:animals.spider,'javan-myna':animals.javanMyna,penguin:animals.penguin,
 'plantain-squirrel':animals.plantainSquirrel,'fruit-bat':animals.fruitBat,dolphin:animals.dolphin,pangolin:animals.pangolin,
 snakehead:animals.snakehead,guppy:animals.guppy,mudskipper:animals.mudskipper,shark:animals.shark,
 'tree-frog':animals.treeFrog,'asian-toad':animals.asianToad,'house-gecko':animals.houseGecko,python:animals.python,'hawksbill-turtle':animals.hawksbillTurtle,
};
export function specimen(id:string):Model{return polishAnimal(id,MODELS[id]!());}
