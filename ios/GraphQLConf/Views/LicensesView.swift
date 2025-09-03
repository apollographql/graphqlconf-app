import SwiftUI

struct LicensesView: View {
  var body: some View {
    ScrollView {
      LazyVStack(alignment: .leading, spacing: 22) {
        VStack {
          Text("apollo-ios")
            .bold()
            .frame(maxWidth: .infinity, alignment: .leading)
          Text("MIT License")
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        VStack {
          Text("SDWebImageSwiftUI")
            .bold()
            .frame(maxWidth: .infinity, alignment: .leading)
          Text("MIT License")
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        VStack {
          Text("SDWebImage")
            .bold()
            .frame(maxWidth: .infinity, alignment: .leading)
          Text("MIT License")
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        VStack {
          Text("swift-atomics")
            .bold()
            .frame(maxWidth: .infinity, alignment: .leading)
          Text("Apache License, Version 2.0")
            .frame(maxWidth: .infinity, alignment: .leading)
        }
      }
      .padding(.all, 16)
    }
  }
}
