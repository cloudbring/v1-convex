Feature: User Authentication
  As a user
  I want to be able to sign up, sign in, and manage my account
  So that I can access the application features

  Background:
    Given the application is running
    And the database is clean

  Scenario: Successful user registration
    Given I am on the signup page
    When I enter valid registration details:
      | name     | John Doe           |
      | email    | john@example.com   |
      | password | SecurePassword123! |
    And I click the signup button
    Then I should be redirected to the onboarding page
    And my account should be created in the database
    And I should receive a welcome email

  Scenario: Successful user login
    Given I have an existing account with email "user@example.com"
    And I am on the login page
    When I enter my email "user@example.com"
    And I enter my password "Password123!"
    And I click the login button
    Then I should be redirected to the dashboard
    And I should see my user menu
    And my session should be active

  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter email "invalid@example.com"
    And I enter password "wrongpassword"
    And I click the login button
    Then I should see an error message
    And I should remain on the login page
    And my session should not be created

  Scenario Outline: Email validation
    Given I am on the signup page
    When I enter email "<email>"
    And I move focus away from the email field
    Then I should see "<validation_result>"

    Examples:
      | email                | validation_result |
      | valid@example.com    | no error         |
      | invalid-email        | email error      |
      | @example.com         | email error      |
      | user@                | email error      |
      |                      | required error   |

  Scenario Outline: Password validation
    Given I am on the signup page
    When I enter password "<password>"
    And I move focus away from the password field
    Then I should see "<validation_result>"

    Examples:
      | password          | validation_result    |
      | SecurePass123!    | no error            |
      | weak              | too short error     |
      | 12345678          | no letters error    |
      | password          | no numbers error    |
      | PASSWORD123       | no lowercase error  |
      |                   | required error      |

  Scenario: Google OAuth login
    Given I am on the login page
    When I click the "Sign in with Google" button
    And I complete the Google OAuth flow
    Then I should be redirected to the dashboard
    And my account should be created or updated
    And I should be signed in

  Scenario: User logout
    Given I am signed in as "user@example.com"
    And I am on the dashboard
    When I click the user menu
    And I click "Sign out"
    Then I should be redirected to the login page
    And my session should be terminated
    And I should not be able to access protected pages

  Scenario: Session persistence
    Given I am signed in as "user@example.com"
    And I am on the dashboard
    When I refresh the page
    Then I should remain signed in
    And I should still see the dashboard

  Scenario: Accessing protected page while signed out
    Given I am not signed in
    When I try to access "/dashboard/settings"
    Then I should be redirected to the login page
    And I should see a message about signing in

  Scenario: Password reset request
    Given I am on the login page
    When I click "Forgot password?"
    And I enter my email "user@example.com"
    And I click "Send reset link"
    Then I should see a confirmation message
    And I should receive a password reset email

  Scenario: Username update
    Given I am signed in as "user@example.com"
    And I am on the settings page
    When I change my username to "newusername"
    And I click "Save changes"
    Then my username should be updated
    And I should see a success message
    And the change should be reflected everywhere

  Scenario: Account deletion
    Given I am signed in as "user@example.com"
    And I am on the settings page
    When I click "Delete account"
    And I confirm the deletion
    Then my account should be deleted from the database
    And I should be signed out
    And I should not be able to sign in with the old credentials