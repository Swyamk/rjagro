use entity::sea_orm_active_enums::UserRole;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    /// Subject (user id) as string — flexible to support string or numeric ids.
    pub sub: String,
    /// Role as string
    pub role: UserRole,
    /// Expiration (as unix timestamp)
    pub exp: usize,
    /// Issued at (optional but useful)
    pub iat: Option<usize>,
}

// impl Claims {
//     /// Convert the role string to a `Role` enum (fallback to Other).
//     pub fn role_enum(&self) -> Role {
//         self.role.parse().unwrap_or(Role::Other(self.role.clone()))
//     }
// }

#[derive(Debug, Error)]
pub enum JwtError {
    #[error("JWT encoding error: {0}")]
    Encode(jsonwebtoken::errors::Error),
    #[error("JWT decoding/validation error: {0}")]
    Decode(jsonwebtoken::errors::Error),
    #[error("JWT secret is not set")]
    MissingSecret,
    #[error("Invalid time value")]
    InvalidTime,
}

/// Create a JWT signed with HMAC SHA-256.
/// - `user_id` becomes `sub`
/// - `role` becomes the `role` claim
/// - `secret` is the HMAC secret (UTF-8 bytes)
/// - `duration_seconds` is how long the token is valid from "now"
pub fn create_jwt(
    user_id: impl ToString,
    role: UserRole,
    secret: &str,
    duration_seconds: usize,
) -> Result<String, JwtError> {
    use jsonwebtoken::{encode, EncodingKey, Header};
    use std::time::{SystemTime, UNIX_EPOCH};

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| JwtError::InvalidTime)?
        .as_secs() as usize;

    let claims = Claims {
        sub: user_id.to_string(),
        role: role,
        exp: now + duration_seconds,
        iat: Some(now),
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(JwtError::Encode)?;
    Ok(token)
}

/// Verify and decode a JWT. Returns `Claims` on success.
pub fn verify_jwt(token: &str, secret: &str) -> Result<Claims, JwtError> {
    use jsonwebtoken::{decode, DecodingKey, Validation};

    let mut validation = Validation::default();
    validation.validate_exp = true;

    let token_data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map_err(JwtError::Decode)?;
    Ok(token_data.claims)
}
