use std::{fmt, str::FromStr};

use serde::{Deserialize, Serialize};

/// Application entity::sea_orm_active_enums.
/// Extend this enum as you add new entity::sea_orm_active_enums.
/// `Other(String)` is kept so tokens with unknown entity::sea_orm_active_enums can still be represented.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Hash)]
pub enum UserRole {
    Admin,
    Accountant,
    Supervisor,
    Other(String),
}

impl fmt::Display for UserRole {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            UserRole::Admin => write!(f, "admin"),
            UserRole::Accountant => write!(f, "accountant"),
            UserRole::Supervisor => write!(f, "supervisor"),
            UserRole::Other(s) => write!(f, "{}", s),
        }
    }
}

impl FromStr for UserRole {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let s_lower = s.to_lowercase();
        match s_lower.as_str() {
            "admin" => Ok(UserRole::Admin),
            "accountant" => Ok(UserRole::Accountant),
            "supervisor" => Ok(UserRole::Supervisor),
            other => Ok(UserRole::Other(other.to_string())),
        }
    }
}
