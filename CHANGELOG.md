# Changelog

All notable changes to the Elits Platform project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-06-07
### Fixed
- `main.py`: Convert healthcheck time fields to nanoseconds for Docker API compatibility
- `main.py`: Add `parse_duration_to_ns()` helper for time.Duration parsing
- `main.py`: Improve error handling in `start_addon()` endpoint

### Added
- Version headers in all Python source files
- `SUPERVISOR_VERSION` constant for runtime version reporting
- `convert_healthcheck_for_docker()` utility function

## [0.1.1] - 2026-06-07
### Fixed
- `requirements.txt`: Pin `urllib3==1.26.18` for docker-py compatibility
- `main.py`: Update Docker SDK 7.0.0 parameter format (`networking_config`, `device_requests`)
- Change Supervisor API port from `8123` to `1977` to avoid HA conflict

### Added
- Initial Supervisor API endpoints: `/health`, `/addons`, `/addons/{slug}/start`
- Hassio shim endpoints: `/self/info`, `/services/discovery`
- Basic addon manifest loading and validation

## [0.1.0] - 2026-06-07
### Added
- Initial repository structure
- GitHub Actions workflow templates
- Docker network configuration (`31.3.77.0/24`)
- First addon manifest template: `llama-inference`
