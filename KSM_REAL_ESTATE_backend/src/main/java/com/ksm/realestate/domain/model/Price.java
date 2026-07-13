package com.ksm.realestate.domain.model;

import java.math.BigDecimal;

/**
 * Price value object representing a monetary amount with currency.
 *
 * @author ulrich675
 * @date 2026-07-08
 */
public class Price {

    private BigDecimal amount;
    private String currency;

    public Price() {
    }

    public Price(BigDecimal amount, String currency) {
        this.amount = amount;
        this.currency = currency;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public static Builder builder() {
        return new Builder();
    }

    /** Builder for {@link Price}. */
    public static class Builder {
        private BigDecimal amount;
        private String currency;

        public Builder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Price build() {
            return new Price(amount, currency);
        }
    }
}
