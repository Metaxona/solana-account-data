use borsh::{BorshSerialize, BorshDeserialize};
use solana_program::{
    account_info::{AccountInfo, next_account_info},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    system_instruction,
    program::invoke,
    sysvar::rent::Rent
};

mod state;

use crate::state::character_sheet::{CharacterSheet, CharacterClass};

entrypoint!(process_instruction);

pub fn process_instruction<'a>(
    program_id: &Pubkey,
    accounts: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction_type = &instruction_data[0];

    msg!("Instruction Type: {}", &instruction_type);
    msg!("Accounts: {:?}", &accounts);
    msg!("The Program Id is: {}", &program_id);

    let account_iter = &mut accounts.iter();
    let user = next_account_info(account_iter)?;
    let character_sheet_account = next_account_info(account_iter)?;
    let system_program_account = next_account_info(account_iter)?;
    
    let character_accounts = CharacterAccounts { 
        user, 
        character_sheet_account, 
        system_program_account
    };
    
    let instructions = match instruction_type {
        0 => Character::Create(CreateInput::try_from_slice(&instruction_data[1..])?),
        1 => Character::Update(CharacterSheet::try_from_slice(&instruction_data[1..])?),
        2 => Character::Delete,
        _ => return Err(ProgramError::InvalidInstructionData),
    };
    
    match instructions {
        Character::Create(input) => {
            return create_character(
                &program_id, 
                &character_accounts, 
                &input.name, 
                &input.class);
        }
        Character::Update(input) => {
            return update_character(&user, &input)
        }
        Character::Delete => {
            return delete_character(&user);
        }
    }

    // Ok(())
}

fn create_character(program_id: &Pubkey, character_accounts: &CharacterAccounts, name: &String, class: &CharacterClass) -> ProgramResult {
    let charater_sheet = CharacterSheet::new(character_accounts.user.key.clone(), name.to_string(), class.clone());
    let character_sheet_size = std::mem::size_of::<CharacterSheet>();
    let lamports_required = Rent::minimum_balance(&Rent::default(), character_sheet_size);
    
    invoke(
        &system_instruction::create_account(
            &character_accounts.user.key, 
            &character_accounts.character_sheet_account.key,
            lamports_required, 
            character_sheet_size as u64, 
            program_id),
        &[character_accounts.user.clone(), character_accounts.character_sheet_account.clone(), character_accounts.system_program_account.clone()]
    )?;

    charater_sheet.serialize(&mut &mut character_accounts.character_sheet_account.data.borrow_mut()[..])?;

    msg!("Charater Created");
    Ok(())
}

fn update_character(user: &AccountInfo, character: &CharacterSheet) -> ProgramResult {
    msg!("Charater Updated: {} {:?}", user.key, character);
    Ok(())
}

fn delete_character(user: &AccountInfo) -> ProgramResult {
    msg!("Character Deleted: {}", user.key);
    Ok(())
}


#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CreateInput {
    name: String,
    class: CharacterClass
}

pub enum Character {
    Create(CreateInput),
    Update(CharacterSheet),
    Delete
}

pub struct CharacterAccounts<'a>{
    user: &'a AccountInfo<'a>, 
    character_sheet_account: &'a AccountInfo<'a>,
    system_program_account: &'a AccountInfo<'a>
}

