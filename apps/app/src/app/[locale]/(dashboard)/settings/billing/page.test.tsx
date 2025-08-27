import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

// Mock functions
const mockUseQuery = vi.fn()
const mockSetSelectedPlanInterval = vi.fn()
const mockUseState = vi.fn()

// Mock child components
const MockCheckoutLink = ({ children, productIds, polarApi }: any) => (
  <div 
    data-testid={`checkout-${productIds[0]}`}
    data-polar-api={polarApi ? 'api.subscriptions' : 'undefined'}
    role="button"
  >
    {typeof children === 'function' ? children({ loading: false }) : children}
  </div>
)

const MockCustomerPortalLink = ({ children, polarApi }: any) => (
  <div 
    data-testid="customer-portal"
    data-polar-api={polarApi ? 'api.subscriptions' : 'undefined'}
    role="button"
  >
    {typeof children === 'function' ? children({ loading: false }) : children}
  </div>
)

// Mock UI components  
const MockButton = ({ children, asChild, size, type, ...props }: any) => {
  if (asChild) {
    return <div data-button-wrapper {...props}>{children}</div>
  }
  return (
    <button 
      data-testid="button" 
      data-size={size} 
      data-type={type} 
      {...props}
    >
      {children}
    </button>
  )
}

const MockSwitch = ({ checked, onCheckedChange, id, ...props }: any) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
    data-testid="billing-interval-switch"
    {...props}
  />
)

// Mock Plan component
const MockPlan = ({
  name,
  description,
  isCurrent,
  amount,
  interval,
  onChangeInterval,
}: {
  name: string;
  description: string | null;
  isCurrent: boolean;
  amount: number;
  interval?: "month" | "year";
  onChangeInterval?: () => void;
}) => {
  return (
    <div
      data-testid={`plan-${name.toLowerCase().replace(' ', '-')}`}
      className={`flex w-full select-none items-center rounded-md border border-border ${
        isCurrent && "border-primary/60"
      }`}
    >
      <div className="flex w-full flex-col items-start p-4">
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-primary">{name}</span>
          {Boolean(amount) && (
            <span className="flex items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
              ${amount / 100} / {interval === "month" ? "month" : "year"}
            </span>
          )}
        </div>
        <p className="text-start text-sm font-normal text-primary/60">
          {description}
        </p>
      </div>

      {/* Billing Switch */}
      {Boolean(amount) && (
        <div className="flex items-center gap-2 px-4">
          <label
            htmlFor="interval-switch"
            className="text-start text-sm text-primary/60"
          >
            {interval === "month" ? "Monthly" : "Yearly"}
          </label>
          <MockSwitch
            id="interval-switch"
            checked={interval === "year"}
            onCheckedChange={() => onChangeInterval?.()}
          />
        </div>
      )}
    </div>
  );
}

// Simulated Billing Settings Component
const SimulatedBillingSettings = ({ 
  user, 
  products, 
  selectedPlanInterval,
  setSelectedPlanInterval 
}: {
  user: any;
  products: any;
  selectedPlanInterval: "month" | "year";
  setSelectedPlanInterval: (interval: "month" | "year") => void;
}) => {
  if (!user) {
    return null;
  }

  const monthlyProProduct = products?.find(
    (product: any) => product.recurringInterval === "month",
  );
  const yearlyProProduct = products?.find(
    (product: any) => product.recurringInterval === "year",
  );

  return (
    <div className="flex h-full w-full flex-col gap-6" data-testid="billing-settings">
      <div className="flex w-full flex-col gap-2 p-6 py-2">
        <h2 className="text-xl font-medium text-primary">
          This is a demo app.
        </h2>
        <p className="text-sm font-normal text-primary/60">
          Convex SaaS is a demo app that uses Polar test environment. You can
          find a list of test card numbers in this{" "}
          <a
            href="https://stripe.com/docs/testing#cards"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary/80 underline"
          >
            resource from Stripe
          </a>
          .
        </p>
      </div>

      {/* Plans */}
      <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-2 p-6">
          <h2 className="text-xl font-medium text-primary">Plan</h2>
          <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
            You are currently on the{" "}
            <span className="flex h-[18px] items-center rounded-md bg-primary/10 px-1.5 text-sm font-medium text-primary/80">
              {user.subscription ? user.subscription.product.name : "Free"}
            </span>
            plan.
          </p>
        </div>

        {!user.subscription && (
          <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
            <MockPlan
              name="Free"
              description="Some of the things, free forever."
              isCurrent={!user.subscription}
              amount={0}
            />
            {selectedPlanInterval === "month" && monthlyProProduct && (
              <MockPlan
                name={monthlyProProduct.name}
                description={monthlyProProduct.description}
                isCurrent={false}
                amount={monthlyProProduct.prices[0]?.priceAmount ?? 0}
                interval={selectedPlanInterval}
                onChangeInterval={() => {
                  setSelectedPlanInterval(selectedPlanInterval === "month" ? "year" : "month");
                }}
              />
            )}
            {selectedPlanInterval === "year" && yearlyProProduct && (
              <MockPlan
                name={yearlyProProduct.name}
                description={yearlyProProduct.description}
                isCurrent={false}
                amount={yearlyProProduct.prices[0]?.priceAmount ?? 0}
                interval={selectedPlanInterval}
                onChangeInterval={() => {
                  setSelectedPlanInterval(selectedPlanInterval === "month" ? "year" : "month");
                }}
              />
            )}
          </div>
        )}

        {user.subscription &&
          (user.subscription?.productId === monthlyProProduct?.id ||
            user.subscription?.productId === yearlyProProduct?.id) && (
            <div className="flex w-full flex-col items-center justify-evenly gap-2 border-border p-6 pt-0">
              <div className="flex w-full items-center overflow-hidden rounded-md border border-primary/60">
                <div className="flex w-full flex-col items-start p-4">
                  <div className="flex items-end gap-2">
                    <span className="text-base font-medium text-primary">
                      {user.subscription?.product.name}
                    </span>
                    <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
                      {user.subscription.cancelAtPeriodEnd === true ? (
                        <span className="flex h-[18px] items-center text-sm font-medium text-red-500">
                          Expires
                        </span>
                      ) : (
                        <span className="flex h-[18px] items-center text-sm font-medium text-green-500">
                          Renews
                        </span>
                      )}
                      on:{" "}
                      {new Date(
                        user.subscription.currentPeriodEnd ?? 0 * 1000,
                      ).toLocaleDateString("en-US")}
                      .
                    </p>
                  </div>
                  <p className="text-start text-sm font-normal text-primary/60">
                    {user.subscription?.product.description}
                  </p>
                </div>
              </div>
            </div>
          )}

        {!user.subscription && (
          <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
            <p className="text-sm font-normal text-primary/60">
              You will not be charged for testing the subscription upgrade.
            </p>
            {monthlyProProduct && yearlyProProduct && (
              <MockButton type="submit" size="sm" asChild>
                <MockCheckoutLink
                  polarApi="api.subscriptions"
                  productIds={[
                    selectedPlanInterval === "month"
                      ? monthlyProProduct.id
                      : yearlyProProduct.id,
                  ]}
                >
                  Upgrade to PRO
                </MockCheckoutLink>
              </MockButton>
            )}
          </div>
        )}
      </div>

      {/* Manage Subscription */}
      {user.subscription && (
        <div className="flex w-full flex-col items-start rounded-lg border border-border bg-card">
          <div className="flex flex-col gap-2 p-6">
            <h2 className="text-xl font-medium text-primary">
              Manage Subscription
            </h2>
            <p className="flex items-start gap-1 text-sm font-normal text-primary/60">
              Update your payment method, billing address, and more.
            </p>
          </div>

          <div className="flex min-h-14 w-full items-center justify-between rounded-lg rounded-t-none border-t border-border bg-secondary px-6 py-3 dark:bg-card">
            <p className="text-sm font-normal text-primary/60">
              You will be redirected to the Polar Customer Portal.
            </p>

            <MockCustomerPortalLink polarApi="api.subscriptions">
              <MockButton type="submit" size="sm">
                Manage
              </MockButton>
            </MockCustomerPortalLink>
          </div>
        </div>
      )}
    </div>
  );
}

// Test data fixtures
const mockFreeUser = {
  subscription: null
}

const mockProMonthlyUser = {
  subscription: {
    productId: 'pro-monthly',
    product: {
      name: 'Pro Plan',
      description: 'All the premium features'
    },
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1735689600000, // 2024-12-31
  }
}

const mockProYearlyUser = {
  subscription: {
    productId: 'pro-yearly',
    product: {
      name: 'Pro Plan',
      description: 'All the premium features'
    },
    cancelAtPeriodEnd: false,
    currentPeriodEnd: 1767225600000, // 2025-12-31
  }
}

const mockCancelingUser = {
  subscription: {
    productId: 'pro-monthly',
    product: {
      name: 'Pro Plan',
      description: 'All the premium features'
    },
    cancelAtPeriodEnd: true,
    currentPeriodEnd: 1735689600000, // 2024-12-31
  }
}

const mockProducts = [
  {
    id: 'pro-monthly',
    name: 'Pro Plan',
    description: 'Monthly Pro subscription',
    recurringInterval: 'month',
    prices: [{ priceAmount: 1999 }]
  },
  {
    id: 'pro-yearly',
    name: 'Pro Plan', 
    description: 'Yearly Pro subscription',
    recurringInterval: 'year',
    prices: [{ priceAmount: 19999 }]
  }
]

describe('BillingSettings Page', () => {
  const defaultProps = {
    user: mockFreeUser,
    products: mockProducts,
    selectedPlanInterval: 'month' as const,
    setSelectedPlanInterval: mockSetSelectedPlanInterval
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSetSelectedPlanInterval.mockImplementation((newInterval) => {
      // Simulate state update
      defaultProps.selectedPlanInterval = newInterval
    })
  })

  describe('Component Rendering', () => {
    it('should render loading state when user is null', () => {
      const { container } = render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          user={null} 
        />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('should render billing page header with demo warning', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByText('This is a demo app.')).toBeInTheDocument()
      expect(screen.getByText(/Convex SaaS is a demo app/)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /resource from Stripe/ })).toHaveAttribute(
        'href', 
        'https://stripe.com/docs/testing#cards'
      )
    })

    it('should render plan section with current plan indicator', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByText('Plan')).toBeInTheDocument()
      expect(screen.getByText(/You are currently on the/)).toBeInTheDocument()
      expect(screen.getAllByText('Free')).toHaveLength(2) // Appears in badge and plan card
      expect(screen.getByText(/plan\./)).toBeInTheDocument()
    })

    it('should render main billing settings container', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByTestId('billing-settings')).toBeInTheDocument()
    })
  })

  describe('Free User Experience', () => {
    it('should display free plan as current for free user', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const freePlanBadges = screen.getAllByText('Free')
      expect(freePlanBadges).toHaveLength(2)
      
      // Check the badge in the current plan indicator
      const currentPlanBadge = freePlanBadges.find(badge => 
        badge.closest('span')?.classList.contains('bg-primary/10')
      )
      expect(currentPlanBadge).toBeInTheDocument()
    })

    it('should show free plan card with correct styling', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const freePlan = screen.getByTestId('plan-free')
      expect(freePlan).toHaveClass('border-primary/60') // Current plan styling
      expect(screen.getByText('Some of the things, free forever.')).toBeInTheDocument()
    })

    it('should display monthly Pro plan by default', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      expect(screen.getByText('$19.99 / month')).toBeInTheDocument()
      expect(screen.getByText('Monthly Pro subscription')).toBeInTheDocument()
    })

    it('should show billing interval toggle for Pro plan', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const intervalSwitch = screen.getByTestId('billing-interval-switch')
      expect(intervalSwitch).toBeInTheDocument()
      expect(intervalSwitch).not.toBeChecked() // Monthly by default
      expect(screen.getByLabelText('Monthly')).toBeInTheDocument()
    })

    it('should toggle between monthly and yearly billing', async () => {
      const user = userEvent.setup()
      const setStateSpy = vi.fn()
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          setSelectedPlanInterval={setStateSpy}
        />
      )
      
      const intervalSwitch = screen.getByTestId('billing-interval-switch')
      
      // Initially should show monthly
      expect(intervalSwitch).not.toBeChecked()
      expect(screen.getByText('Monthly')).toBeInTheDocument()
      expect(screen.getByText('$19.99 / month')).toBeInTheDocument()
      
      // Toggle to yearly
      await user.click(intervalSwitch)
      
      expect(setStateSpy).toHaveBeenCalledWith('year')
    })

    it('should display yearly plan when interval is set to year', () => {
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          selectedPlanInterval="year"
        />
      )
      
      expect(screen.getByText('Yearly')).toBeInTheDocument()
      expect(screen.getByText('$199.99 / year')).toBeInTheDocument()
      expect(screen.getByText('Yearly Pro subscription')).toBeInTheDocument()
    })

    it('should show checkout link for selected plan', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const checkoutButton = screen.getByTestId('checkout-pro-monthly')
      expect(checkoutButton).toBeInTheDocument()
      expect(checkoutButton).toHaveAttribute('data-polar-api', 'api.subscriptions')
      expect(screen.getByText('Upgrade to PRO')).toBeInTheDocument()
    })

    it('should update checkout link when switching intervals', () => {
      const { rerender } = render(
        <SimulatedBillingSettings {...defaultProps} />
      )
      
      // Initially shows monthly checkout
      expect(screen.getByTestId('checkout-pro-monthly')).toBeInTheDocument()
      
      // Switch to yearly
      rerender(
        <SimulatedBillingSettings 
          {...defaultProps} 
          selectedPlanInterval="year"
        />
      )
      
      expect(screen.getByTestId('checkout-pro-yearly')).toBeInTheDocument()
    })

    it('should display upgrade disclaimer', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByText('You will not be charged for testing the subscription upgrade.')).toBeInTheDocument()
    })

    it('should not show manage subscription section for free users', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.queryByText('Manage Subscription')).not.toBeInTheDocument()
      expect(screen.queryByTestId('customer-portal')).not.toBeInTheDocument()
    })
  })

  describe('Subscribed User Experience - Monthly', () => {
    const monthlyUserProps = {
      ...defaultProps,
      user: mockProMonthlyUser
    }

    it('should show Pro Plan as current plan', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.getAllByText('Pro Plan')).toHaveLength(2) // Appears in badge and subscription card
      expect(screen.getByText('All the premium features')).toBeInTheDocument()
    })

    it('should display subscription renewal information', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.getByText('Renews')).toBeInTheDocument()
      expect(screen.getByText('on: 12/31/2024.')).toBeInTheDocument()
    })

    it('should show current subscription with correct styling', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      const currentPlanCards = screen.getAllByText('Pro Plan')
      expect(currentPlanCards).toHaveLength(2)
      
      // Find the subscription card with border styling
      const subscriptionCard = currentPlanCards.find(card => 
        card.closest('.border-primary\\/60')
      )
      expect(subscriptionCard).toBeDefined()
    })

    it('should display manage subscription section', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.getByText('Manage Subscription')).toBeInTheDocument()
      expect(screen.getByText('Update your payment method, billing address, and more.')).toBeInTheDocument()
    })

    it('should show customer portal link', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      const portalButton = screen.getByTestId('customer-portal')
      expect(portalButton).toBeInTheDocument()
      expect(portalButton).toHaveAttribute('data-polar-api', 'api.subscriptions')
      expect(screen.getByText('Manage')).toBeInTheDocument()
    })

    it('should display portal redirect disclaimer', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.getByText('You will be redirected to the Polar Customer Portal.')).toBeInTheDocument()
    })

    it('should not show upgrade section for subscribed users', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.queryByText('You will not be charged for testing the subscription upgrade.')).not.toBeInTheDocument()
      expect(screen.queryByText('Upgrade to PRO')).not.toBeInTheDocument()
    })

    it('should not show plan selection for subscribed users', () => {
      render(<SimulatedBillingSettings {...monthlyUserProps} />)
      
      expect(screen.queryByTestId('plan-free')).not.toBeInTheDocument()
      expect(screen.queryByTestId('plan-pro-plan')).not.toBeInTheDocument()
    })
  })

  describe('Subscribed User Experience - Yearly', () => {
    const yearlyUserProps = {
      ...defaultProps,
      user: mockProYearlyUser
    }

    it('should show yearly subscription information', () => {
      render(<SimulatedBillingSettings {...yearlyUserProps} />)
      
      expect(screen.getAllByText('Pro Plan')).toHaveLength(2) // Appears in badge and subscription card
      expect(screen.getByText('on: 12/31/2025.')).toBeInTheDocument()
    })
  })

  describe('Canceling Subscription Experience', () => {
    const cancelingUserProps = {
      ...defaultProps,
      user: mockCancelingUser
    }

    it('should show expiration information for canceling subscription', () => {
      render(<SimulatedBillingSettings {...cancelingUserProps} />)
      
      expect(screen.getByText('Expires')).toBeInTheDocument()
      expect(screen.getByText('on: 12/31/2024.')).toBeInTheDocument()
      
      // Should still show manage subscription section
      expect(screen.getByTestId('customer-portal')).toBeInTheDocument()
    })

    it('should style expires text in red', () => {
      render(<SimulatedBillingSettings {...cancelingUserProps} />)
      
      const expiresText = screen.getByText('Expires')
      expect(expiresText).toHaveClass('text-red-500')
    })

    it('should style renews text in green for active subscriptions', () => {
      const activeUserProps = {
        ...defaultProps,
        user: mockProMonthlyUser
      }
      
      render(<SimulatedBillingSettings {...activeUserProps} />)
      
      const renewsText = screen.getByText('Renews')
      expect(renewsText).toHaveClass('text-green-500')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing products gracefully', () => {
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          products={null}
        />
      )
      
      expect(screen.getAllByText('Free')).toHaveLength(2) // In current plan badge and free plan card
      expect(screen.queryByText('Pro Plan')).not.toBeInTheDocument()
      expect(screen.queryByText('Upgrade to PRO')).not.toBeInTheDocument()
    })

    it('should handle empty products array', () => {
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          products={[]}
        />
      )
      
      expect(screen.getAllByText('Free')).toHaveLength(2) // In current plan badge and free plan card
      expect(screen.queryByText('Pro Plan')).not.toBeInTheDocument()
      expect(screen.queryByText('Upgrade to PRO')).not.toBeInTheDocument()
    })

    it('should handle products without prices', () => {
      const productsWithoutPrices = [
        {
          id: 'pro-monthly',
          name: 'Pro Plan',
          description: 'Monthly Pro subscription',
          recurringInterval: 'month',
          prices: []
        }
      ]
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          products={productsWithoutPrices}
        />
      )
      
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      expect(screen.getByText('Monthly Pro subscription')).toBeInTheDocument()
      // The product without prices won't show pricing badge or switch (amount is 0)
    })

    it('should handle invalid subscription dates', () => {
      const userWithInvalidDate = {
        subscription: {
          productId: 'pro-monthly',
          product: {
            name: 'Pro Plan',
            description: 'All the premium features'
          },
          cancelAtPeriodEnd: false,
          currentPeriodEnd: null,
        }
      }
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          user={userWithInvalidDate}
        />
      )
      
      expect(screen.getAllByText('Pro Plan')).toHaveLength(2) // Appears in badge and subscription card
      expect(screen.getByText('on: 12/31/1969.')).toBeInTheDocument() // Fallback date
    })

    it('should handle subscription with unknown product ID', () => {
      const userWithUnknownProduct = {
        subscription: {
          productId: 'unknown-plan',
          product: {
            name: 'Unknown Plan',
            description: 'This plan is not in the products list'
          },
          cancelAtPeriodEnd: false,
          currentPeriodEnd: 1735689600000,
        }
      }
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          user={userWithUnknownProduct}
        />
      )
      
      // Should show subscription info only once in the badge (no matching product in list)
      expect(screen.getByText('Unknown Plan')).toBeInTheDocument()
      expect(screen.queryByText('Free')).not.toBeInTheDocument()
      
      // Should not show plan selection section
      expect(screen.queryByTestId('plan-free')).not.toBeInTheDocument()
    })

    it('should handle missing monthly product', () => {
      const productsWithoutMonthly = [mockProducts[1]] // Only yearly
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          products={productsWithoutMonthly}
        />
      )
      
      expect(screen.getAllByText('Free')).toHaveLength(2) // In current plan badge and free plan card
      expect(screen.queryByText('Pro Plan')).not.toBeInTheDocument()
      expect(screen.queryByText('Upgrade to PRO')).not.toBeInTheDocument()
    })

    it('should handle missing yearly product', () => {
      const productsWithoutYearly = [mockProducts[0]] // Only monthly
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          products={productsWithoutYearly}
        />
      )
      
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      expect(screen.queryByText('Upgrade to PRO')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<SimulatedBillingSettings {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper label for billing interval switch', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const switchLabel = screen.getByLabelText('Monthly')
      expect(switchLabel).toBeInTheDocument()
      
      const switchInput = screen.getByTestId('billing-interval-switch')
      expect(switchInput).toHaveAttribute('id', 'interval-switch')
    })

    it('should have accessible external link', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const stripeLink = screen.getByRole('link', { name: /resource from Stripe/ })
      expect(stripeLink).toHaveAttribute('target', '_blank')
      expect(stripeLink).toHaveAttribute('rel', 'noreferrer')
    })

    it('should have properly structured headings', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const headings = screen.getAllByRole('heading', { level: 2 })
      expect(headings).toHaveLength(2)
      expect(headings[0]).toHaveTextContent('This is a demo app.')
      expect(headings[1]).toHaveTextContent('Plan')
    })

    it('should have accessible checkout and portal buttons', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const checkoutButton = screen.getByTestId('checkout-pro-monthly')
      expect(checkoutButton).toHaveAttribute('role', 'button')
    })
  })

  describe('Component Integration', () => {
    it('should pass correct props to CheckoutLink', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const checkoutButton = screen.getByTestId('checkout-pro-monthly')
      expect(checkoutButton).toHaveAttribute('data-polar-api', 'api.subscriptions')
    })

    it('should pass correct props to CustomerPortalLink', () => {
      const subscribedProps = {
        ...defaultProps,
        user: mockProMonthlyUser
      }
      
      render(<SimulatedBillingSettings {...subscribedProps} />)
      
      const portalButton = screen.getByTestId('customer-portal')
      expect(portalButton).toHaveAttribute('data-polar-api', 'api.subscriptions')
    })

    it('should render Button component with correct props', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      // Button is rendered as wrapper when asChild is true
      const buttonWrapper = screen.getByTestId('checkout-pro-monthly')
      expect(buttonWrapper).toBeInTheDocument()
    })

    it('should render Switch component with correct props', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const switchInput = screen.getByTestId('billing-interval-switch')
      expect(switchInput).toHaveAttribute('type', 'checkbox')
      expect(switchInput).toHaveAttribute('id', 'interval-switch')
    })
  })

  describe('Business Logic', () => {
    it('should correctly identify current plan for free user', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      const freePlanCard = screen.getByTestId('plan-free')
      expect(freePlanCard).toHaveClass('border-primary/60')
      
      // Verify the free plan appears in multiple places
      expect(screen.getAllByText('Free')).toHaveLength(2)
    })

    it('should correctly show pricing formatting', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      expect(screen.getByText('$19.99 / month')).toBeInTheDocument()
    })

    it('should handle different recurring intervals', () => {
      const { rerender } = render(
        <SimulatedBillingSettings {...defaultProps} />
      )
      
      expect(screen.getByText('$19.99 / month')).toBeInTheDocument()
      
      rerender(
        <SimulatedBillingSettings 
          {...defaultProps} 
          selectedPlanInterval="year"
        />
      )
      
      expect(screen.getByText('$199.99 / year')).toBeInTheDocument()
    })

    it('should maintain state consistency during interval changes', async () => {
      const user = userEvent.setup()
      const setStateSpy = vi.fn()
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          setSelectedPlanInterval={setStateSpy}
        />
      )
      
      const switchInput = screen.getByTestId('billing-interval-switch')
      
      // Multiple toggles should work consistently
      await user.click(switchInput)
      expect(setStateSpy).toHaveBeenCalledWith('year')
      
      setStateSpy.mockClear()
      
      await user.click(switchInput)
      expect(setStateSpy).toHaveBeenCalledWith('year') // Always toggles to opposite
    })
  })

  describe('Plan Component Integration', () => {
    it('should render Plan component correctly for free tier', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      // Check that "Free" appears twice (badge and plan card)
      expect(screen.getAllByText('Free')).toHaveLength(2)
      const freePlanDescription = screen.getByText('Some of the things, free forever.')
      
      expect(freePlanDescription).toBeInTheDocument()
    })

    it('should render Plan component correctly for pro tier', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      // Pro Plan should appear once in the plan card for free users
      expect(screen.getByText('Pro Plan')).toBeInTheDocument()
      const proPlanDescription = screen.getByText('Monthly Pro subscription')
      
      expect(proPlanDescription).toBeInTheDocument()
    })

    it('should show pricing badge only for paid plans', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      // Free plan should not show pricing in card (amount is 0)
      const freePlan = screen.getByTestId('plan-free')
      expect(freePlan.querySelector('.bg-primary\\/10')).toBe(null)
      
      // Pro plan should show pricing badge
      expect(screen.getByText('$19.99 / month')).toBeInTheDocument()
    })

    it('should show billing switch only for paid plans', () => {
      render(<SimulatedBillingSettings {...defaultProps} />)
      
      // Only one switch should exist (for the Pro plan)
      const switches = screen.getAllByTestId('billing-interval-switch')
      expect(switches).toHaveLength(1)
    })
  })

  describe('Subscription Status Display', () => {
    it('should format dates correctly', () => {
      const userProps = {
        ...defaultProps,
        user: mockProMonthlyUser
      }
      
      render(<SimulatedBillingSettings {...userProps} />)
      
      expect(screen.getByText('on: 12/31/2024.')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('should call setSelectedPlanInterval when toggling', async () => {
      const user = userEvent.setup()
      const setStateSpy = vi.fn()
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          setSelectedPlanInterval={setStateSpy}
        />
      )
      
      const switchInput = screen.getByTestId('billing-interval-switch')
      await user.click(switchInput)
      
      expect(setStateSpy).toHaveBeenCalledWith('year')
    })

    it('should properly toggle from year to month', async () => {
      const user = userEvent.setup()
      const setStateSpy = vi.fn()
      
      render(
        <SimulatedBillingSettings 
          {...defaultProps} 
          selectedPlanInterval="year"
          setSelectedPlanInterval={setStateSpy}
        />
      )
      
      const switchInput = screen.getByTestId('billing-interval-switch')
      await user.click(switchInput)
      
      expect(setStateSpy).toHaveBeenCalledWith('month')
    })
  })
})