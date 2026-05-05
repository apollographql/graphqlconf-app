import Foundation

private let userIdKey = "userId"

func userId() -> String {
  if let existing = UserDefaults.standard.string(forKey: userIdKey) {
    return existing
  }
  let newId = UUID().uuidString
  UserDefaults.standard.set(newId, forKey: userIdKey)
  return newId
}
