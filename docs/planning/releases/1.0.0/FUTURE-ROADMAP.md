# TenantFlow - Future Roadmap

## Purpose

This backlog preserves enhancements beyond the 1.0.0 MVP. Consider them after the core product is stable and its needs are validated. No feature is implemented by its presence here, and no delivery date is committed.

Use the [canonical SRS release boundaries](../../../requirements/TenantFlow-SRS.md#24-canonical-release-boundaries) for the distinction between required base behavior and these enhancements. The [version plan](VERSION-PLANNING.md) retains the MVP milestones; it does not postpone their required base features to this backlog.

Required customer tags/notes/history, operational dashboard summaries, in-app notifications, lifecycle/invitation emails, billing alerts, application API documentation and payment-provider webhooks remain MVP scope. The entries below extend those capabilities.

---

# Identity Enhancements

## MFA

- Multi-factor enrollment and challenges
- Tenant MFA policies, subject to identity-provider ownership design

Additional SSO/OAuth integrations and enterprise provisioning appear under Enterprise Features. Existing frontend Stack Auth integration is retained; it is not evidence that these enhancements are complete.

---

# CRM Enhancements

## Customer Tagging Enhancements

- Dynamic/automated tagging beyond manually managed customer tags
- Smart segmentation

Basic customer tags and tag filtering belong to the MVP customer milestone.

## Customer Pipelines

- Lead
- Prospect
- Qualified
- Customer
- Churned

## Customer Activity Enhancements

- Richer customer timelines beyond required notes/history
- Expanded interaction history
- Structured contact logs

---

# Project Enhancements

## Task Dependencies

- Blocking tasks
- Dependency graph

## Time Tracking

- Time entries
- Timesheets
- Productivity reports

## Project Templates

- Reusable project structures

---

# Advanced Notifications

## Email Notifications

- SMTP integration
- Delivery tracking

This covers general notification delivery enhancements. Required account confirmation/reset, invitation emails and billing alerts remain in their MVP workflows; they need not wait for a separate notification-delivery service.

## Push Notifications

- Browser notifications
- Mobile notifications

## Notification Digests

- Daily summaries
- Weekly summaries

---

# Advanced File Management

## Version Control

- File versions
- Rollback support

## Virus Scanning

- Malware detection
- Quarantine workflows

## CDN Integration

- Faster downloads

---

# Subscription Enhancements

## Coupon System

- Percentage discounts
- Fixed discounts

## Trials

- Flexible trial policies

## Usage-Based Billing

- Metered billing

---

# Reporting & Analytics

MVP task/member/project/activity and subscription/usage summaries are already required. These entries add business analytics beyond those operational summaries.

## Tenant Dashboard

- Revenue analytics
- Subscription analytics

## Customer Analytics

- Customer growth
- Customer retention

## Project Analytics

- Productivity reports
- Completion trends

---

# API Platform

## API Keys

- Personal access tokens
- Tenant API keys

## Webhooks

- Outbound events
- Retry policies

Payment-provider webhook reception, verification and idempotency are required billing behavior, separate from outbound customer integrations.

## Public Developer API

- Public REST API contracts for external developers
- Public OpenAPI documentation and onboarding

Application-facing API contracts, API documentation and exploration remain part of the backend foundation; they are not deferred by this public-platform entry.

---

# Enterprise Features

## SSO

- Google Workspace
- Azure AD
- Okta

## SCIM

- User provisioning

## Audit Export

- CSV export
- Compliance exports

## Data Retention Policies

- Automated cleanup

---

# Platform Enhancements

## Feature Flag Administration

- Flag management and feature toggles
- Lifecycle and access rules before rollout automation

This preserves the feature-flag idea previously placed in version 0.9.0, aligned with the SRS future-safe scope. Basic system settings and core admin operations remain MVP requirements.

## Multi-Region Deployment

- Region selection

## Feature Rollouts

- Percentage rollout
- Tenant-specific rollout

## Support Tools

- Admin impersonation improvements
- Support ticket integration

---

# Mobile Applications

## iOS App

- Notifications
- Customer management

## Android App

- Task management
- Offline support

---

# AI Features

## AI Task Suggestions

- Priority recommendations

## AI Customer Insights

- Churn prediction

## AI Reporting

- Natural language summaries

## AI Assistant

- Tenant-specific assistant
- Knowledge retrieval
