import SwiftUI
import Apollo
import ApolloAPI
import ConnectorAPI

struct FeedbackView: View {

  let sessionId: String

  @State private var rating: Rating?
  @State private var comment: String = ""
  @State private var submitting: Bool = false
  @State private var submitted: Bool = false
  @State private var error: Bool = false

  var body: some View {
    VStack(alignment: .leading, spacing: 0) {
      Text("Feedback")
        .frame(maxWidth: .infinity, alignment: .leading)
        .font(.HostGrotesk.h3)
        .foregroundStyle(Theme.primaryText)

      if submitted {
        Spacer(minLength: 16)
        Text("Thanks for your feedback!")
          .frame(maxWidth: .infinity, alignment: .leading)
          .font(.HostGrotesk.large)
          .foregroundStyle(Theme.primaryText)
      } else {
        Spacer(minLength: 16)
        HStack(spacing: 8) {
          RatingChip(label: "😞", selected: rating == .disappointed) {
            rating = .disappointed
          }
          RatingChip(label: "😐", selected: rating == .neutral) {
            rating = .neutral
          }
          RatingChip(label: "😊", selected: rating == .happy) {
            rating = .happy
          }
        }
        .disabled(submitting)

        Spacer(minLength: 16)
        ZStack(alignment: .topLeading) {
          if comment.isEmpty {
            Text("Leave a comment (optional)")
              .font(.HostGrotesk.large)
              .foregroundStyle(AnyShapeStyle(Theme.primaryText).opacity(0.5))
              .padding(.horizontal, 12)
              .padding(.vertical, 12)
          }
          TextEditor(text: $comment)
            .font(.HostGrotesk.large)
            .foregroundStyle(Theme.primaryText)
            .scrollContentBackground(.hidden)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .frame(minHeight: 96)
            .disabled(submitting)
        }
        .overlay(
          Rectangle()
            .stroke(AnyShapeStyle(Theme.primaryText).opacity(0.5), lineWidth: 1)
        )

        if error {
          Spacer(minLength: 8)
          Text("Oh no, something went wrong. Please try again.")
            .font(.HostGrotesk.medium)
            .foregroundStyle(Theme.tint)
        }

        Spacer(minLength: 16)
        Button(action: submit) {
          Text(submitting ? "Submitting…" : "Submit")
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .font(.HostGrotesk.large)
            .foregroundStyle(AnyShapeStyle(Theme.primaryText).opacity(submitEnabled ? 1.0 : 0.5))
            .overlay(
              Rectangle()
                .stroke(
                  AnyShapeStyle(Theme.primaryText).opacity(submitEnabled ? 1.0 : 0.5),
                  lineWidth: 1
                )
            )
        }
        .disabled(!submitEnabled)
      }
    }
  }

  private var submitEnabled: Bool {
    rating != nil && !submitting
  }

  private func submit() {
    guard let rating else { return }
    submitting = true
    error = false
    let input = FeedbackInput(
      userId: userId(),
      sessionId: sessionId,
      rating: GraphQLEnum(rating),
      comment: comment
    )
    Task {
      do {
        let response = try await Network.shared.apollo.perform(
          mutation: SubmitFeedbackMutation(input: input)
        )
        await MainActor.run {
          submitting = false
          if response.data?.submitFeedback == true {
            submitted = true
          } else {
            error = true
          }
        }
      } catch {
        await MainActor.run {
          submitting = false
          self.error = true
        }
      }
    }
  }
}

private struct RatingChip: View {
  let label: String
  let selected: Bool
  let action: () -> Void

  var body: some View {
    Button(action: action) {
      Text(label)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .font(.system(size: 28))
        .overlay(
          Rectangle()
            .stroke(
              selected ? AnyShapeStyle(Theme.tint) : AnyShapeStyle(Theme.primaryText.opacity(0.5)),
              lineWidth: 1
            )
        )
    }
  }
}
