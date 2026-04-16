// This is the exact regex that the Verenigingsregister API uses, so it should match their server side validation.
// More info: https://vlaamseoverheid.atlassian.net/wiki/spaces/AGB/pages/6336155052/Contactgegevens+-+Als+GI+wil+ik+de+contactgegevens+van+een+vereniging+beheren#Business-regels
export const emailRegex =
  /^([_-]*([a-z0-9]+[.!#$%&'*+/=?^_`{|}~-]?){1,}[_-]*)@(([a-z0-9]+[.-]?)*[a-z0-9]\.)+[a-z]{2,}$/;
