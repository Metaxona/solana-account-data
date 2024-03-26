import { u8, u16, u32, seq, struct, cstr } from '@solana/buffer-layout';
import {publicKey} from "@solana/buffer-layout-utils"
import web3 from "@solana/web3.js"
import * as borsh from "borsh"
import fs from "fs"

const connection = new web3.Connection("http://localhost:8899", "confirmed");
const PROGRAM_ID = new web3.PublicKey("7XnTxu3KJ21TsJrVc78CvprvYPpTfemX7R6MGhuPLKcD")
const secretKey = JSON.parse(fs.readFileSync('/home/monq--/.config/solana/id.json', 'utf8').toString()) as number[];
const KEYPAIR = web3.Keypair.fromSecretKey(Uint8Array.from(secretKey))
enum METHODS {
  CREATE,
  UPDATE,
  DELETE,
}

enum CharacterClass {

  VILLAGER,
  WARRIOR,
  ARCHER,
  MAGE
}

class Assignable {
  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

class CreateInput extends Assignable {
    static schema(){
        return {
            struct: {
                name: "string",
                class: "u8"
            }
        } 
    }
    toBuffer() {
        return Buffer.from(borsh.serialize(CreateInput.schema() as any, this));
    }
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateInput.schema() as any, buffer);
    }
    toInstruction() {
        return Buffer.concat([Buffer.from([METHODS.CREATE]), this.toBuffer()]);
    }
}

class CharacterSheet extends Assignable  {
  static schema(){
    
    class Stats extends Assignable {
      static schema(){
        return {
            struct: {
                strength: 'u32',
                constitution: 'u32',
                dexterity: 'u32',
                intelligence: 'u32',
                wisdom: 'u32',
                charisma: 'u32',
            }
        }
      }
    }

    const character_sheet_schema = {
        struct: {
            owner: { array: { type: "u8", len: 32}},
            name: "string",
            class: "u8",
            level: "u16",
            xp: "u32",
            stats: Stats.schema()
        }
    } 
    return character_sheet_schema
  }
  static fromBuffer(buffer: Buffer) {
    return borsh.deserialize(CharacterSheet.schema() as any, buffer);
  }

  toBuffer() {
    return Buffer.from(borsh.serialize(CharacterSheet.schema() as any, this));
  }
}

const create_Tx_Instruction = new CreateInput({ name: "Mon", class: CharacterClass.WARRIOR }).toInstruction();

console.log(create_Tx_Instruction);

const character_sheet_account = web3.Keypair.generate()

const create_transaction = new web3.TransactionInstruction({
  programId: PROGRAM_ID,
  keys: [
    {pubkey: KEYPAIR.publicKey, isSigner: true, isWritable: true},
    {pubkey: character_sheet_account.publicKey, isSigner: true, isWritable: true},
    {pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false}
  ], // Add accounts as needed
  data: create_Tx_Instruction,
});
async function m(){
const tx = await web3.sendAndConfirmTransaction(connection, new web3.Transaction().add(create_transaction), [KEYPAIR, character_sheet_account], {skipPreflight: true, commitment: "confirmed" })
console.log(tx)

const confirmed = await connection.confirmTransaction(tx, "confirmed")
console.log("Confirmed: ", confirmed)
}
// m().catch(console.error)

// interface ICharacterStat {
//     strength: number,
//     constitution: number,
//     dexterity: number,
//     intelligence: number,
//     wisdom: number,
//     charisma: number,
// }

// interface ICharacterSheet {
//         owner: web3.PublicKey;
//         name: any;
//         class: number;
//         level: number;
//         xp: number;
//         stats: ICharacterStat;
// }

// const layout = struct<ICharacterSheet>([
//   publicKey('owner'),
//   seq(u8(), 18, "name"),
//   u8('class'),
//   u16('level'),
//   u32('xp'),
//   struct<ICharacterStat>([
//     u32('strength'),
//     u32('constitution'),
//     u32('dexterity'),
//     u32('intelligence'),
//     u32('wisdom'),
//     u32('charisma')
//   ], "stats"),
// ])

async function my(){
  // const addr = character_sheet_account.publicKey
  // const addr = new web3.PublicKey("DcQ5Tqz324GEAGZfnHqNfKeMGjCmo2Z9WVMQPwpHvC1r")
  // const addr = new web3.PublicKey("BugZpYpcuhthuUEwXPD3hML5Ukpu7dj9NTVTrupBPJTD")
  // const addr = new web3.PublicKey("2SpMLQeLFazkjV3t3w7fktQf2RYZwMasfS8LjP6anAJv")
  const addr = new web3.PublicKey("8z6ES44o3cY71ikwT6aYy2GC2SRWS365rgqEMKhTpdN6")
  const info = await connection.getAccountInfo(addr)
  // console.log(info?.data)
  // console.log(info?.data.toString())
  // console.log("===========")
  // console.log(Array.from(CharacterSheet.schema().entries()))
  // let data = layout.decode(info?.data as Buffer )
  // const decodedArray: any = data.name;
  // const length = decodedArray[0] | (decodedArray[1] << 8) | (decodedArray[2] << 16) | (decodedArray[3] << 24);
  // const stringBytes = decodedArray.slice(4, 4 + length);
  // const string = Buffer.from(stringBytes).toString('utf8');
  // console.log("owner - ", data.owner.toBase58())
  // console.log("name - ", string)
  // // console.log("name - ", data.name)
  // console.log("class - ", data.class)
  // console.log("level - ", data.level)
  // console.log("xp - ", data.xp)
  // console.log("stats: charisma - ", data.stats.charisma)
  // console.log("stats: strength - ", data.stats.strength)
  // console.log("stats: constitution - ", data.stats.constitution)
  // console.log("stats: dexterity - ", data.stats.dexterity)
  // console.log("stats: wisdom - ", data.stats.wisdom)
  // console.log("stats: intelligence - ", data.stats.intelligence)
  
  const d = CharacterSheet.fromBuffer(info?.data as Buffer); 
  const da = JSON.parse(JSON.stringify(d))
  da.owner = new web3.PublicKey((d as any).owner).toBase58()
  console.log(da)
  
  // let _data = CharacterSheet.fromBuffer(info.data)
  // console.log(_data)
  
}

my().catch(console.error)

