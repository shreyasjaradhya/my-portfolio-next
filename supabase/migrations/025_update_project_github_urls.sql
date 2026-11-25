-- Migration: 025_update_project_github_urls.sql
-- Description: Sets verified GitHub repository links for all 8 engineering projects

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/hospital-management-system-python'
WHERE slug = 'hospital-management-system-python';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/digital-timer-fpga'
WHERE slug = 'digital-timer-fpga';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/traffic-light-controller'
WHERE slug = 'traffic-light-controller';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/arduino-hospital-robot'
WHERE slug = 'arduino-hospital-robot';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/frequency-selective-circuit'
WHERE slug = 'frequency-selective-circuit';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/fifo-buffer-systemverilog'
WHERE slug = 'fifo-buffer-systemverilog';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/tinkercad-electronic-circuit-design'
WHERE slug = 'tinkercad-electronic-circuit-design';

UPDATE projects 
SET github_url = 'https://github.com/shreyasjaradhya/reactor-temperature-control'
WHERE slug = 'reactor-temperature-control';
