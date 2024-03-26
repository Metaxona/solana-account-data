use borsh::{BorshDeserialize, BorshSerialize };
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Copy, Debug)]
pub enum CharacterClass {
    Villager,
    Warrior,
    Archer,
    Mage
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CharacterStat {
    pub strength: u32,
    pub contitution: u32,
    pub dexterity: u32,
    pub intelligence: u32,
    pub wisdom: u32,
    pub charisma: u32,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CharacterSheet {
    pub owner: Pubkey,
    pub name: String,
    pub class: CharacterClass,
    pub level: u16,
    pub xp: u32,
    pub stats: CharacterStat
}

const DEFAULT_CHARACTER_STATUS: CharacterStat = CharacterStat {
    strength: 5,
    contitution: 5,
    dexterity: 5,
    intelligence: 5,
    wisdom: 5,
    charisma: 5
};

impl CharacterSheet {
    
    pub fn new(
        owner: Pubkey,
        name: String,
        class: CharacterClass
    ) -> Self {
        CharacterSheet {
            owner,
            name,
            class,
            level: 1,
            xp: 0,
            stats: DEFAULT_CHARACTER_STATUS
        }
    }

    pub fn update(
        character: CharacterSheet
    ) -> Self {
        character
    }
}
