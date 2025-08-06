import SwiftUI

enum Theme: ShapeStyle {
//  static let rhodamine = Color(hex: 0xFFE10098)

  case tint
  case tintReverse
  case navigationBar
  case navigationBarReverse
  case tabBar
  case primaryText
  case mainBackground
  case cellBackground
  case cellStroke
  case avatarOverlay

  func resolve(in environment: EnvironmentValues) -> some ShapeStyle {
    if environment.colorScheme == .dark {
      return resolveDarkColor()
    }

    return resolveLightColor()
  }

  func resolveLightColor() -> Color {
    switch self {
    case .tint, .navigationBarReverse: return Color(hex: 0xe10098)
    case .tintReverse, .navigationBar, .tabBar: return Color(hex: 0xffffff)
    case .primaryText: return Color(hex: 0x19191C)
    case .mainBackground: return Color(hex: 0xfafcf4)
    case .cellBackground: return Color(hex: 0xffffff)
    case .cellStroke: return Color(hex: 0xe7e9e3)
    case .avatarOverlay: return Color(hex: 0x85B913).opacity(0.2)
    }
  }

  func resolveDarkColor() -> Color {
    #warning("Implement dark mode colors")
    return resolveLightColor()
  }
}

struct EventTypeColorMap {

  static let `default` = Color(hex: 0xdcded4)

  static let colors: [String: Color] = [
    "BREAKS": Color(hex: 0x7DAA5E, alpha: 1),
    "KEYNOTE SESSIONS": Color(hex: 0x7e66cc, alpha: 1),
    "LIGHTNING TALKS": Color(hex: 0x1a5b77, alpha: 1),
    "SESSION PRESENTATIONS": Color(hex: 0x5c2e75, alpha: 1),
    "WORKSHOPS": Color(hex: 0x4b5fc0, alpha: 1),
    "UNCONFERENCE": Color(hex: 0x7e66cc, alpha: 1),
    "API PLATFORM": Color(hex: 0x4e6e82, alpha: 1),
    "BACKEND": Color(hex: 0x36C1A0, alpha: 1),
    "BREAKS & SPECIAL EVENTS": Color(hex: 0x7DAA5E, alpha: 1),
    "DEFIES CATEGORIZATION": Color(hex: 0x894545, alpha: 1),
    "DEVELOPER EXPERIENCE": Color(hex: 0x6fc9af, alpha: 1),
    "FEDERATION AND COMPOSITE SCHEMAS": Color(hex: 0xcbc749, alpha: 1),
    "GRAPHQL CLIENTS": Color(hex: 0xca78fc, alpha: 1),
    "GRAPHQL IN PRODUCTION": Color(hex: 0xe4981f, alpha: 1),
    "GRAPHQL SECURITY": Color(hex: 0xCC6BB0, alpha: 1),
    "GRAPHQL SPEC": Color(hex: 0x6B73CC, alpha: 1),
    "SCALING": Color(hex: 0x8D8D8D, alpha: 1),
    "FRONTEND": Color(hex: 0x7F00FF, alpha: 1),
    "DOCUMENTATION": Color(hex: 0xFA8072, alpha: 1),
    "SCHEMA EVOLUTION": Color(hex: 0xD8BFD8, alpha: 1),
    "SECURITY": Color(hex: 0x6495ED, alpha: 1),
    "CASE STUDIES": Color(hex: 0x894545, alpha: 1),
    "FEDERATION AND DISTRIBUTED SYSTEMS": Color(hex: 0xC8251, alpha: 1)
  ]

}
