export const xmlConfig = `
<EngineDisplay>
	<EnginePage>
		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-50</BeginAngle>
				<EndAngle>190</EndAngle>
				<ValuePos>End</ValuePos>
				<CursorType>Triangle</CursorType>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_TorqueGauge</ID>
			<Title>FT-LB</Title>
			<Unit>x100</Unit>
			<Minimum>0</Minimum>
			<Maximum>3000</Maximum>
			<Value>
				<Simvar name="TURB ENG FREE TURBINE TORQUE:1" unit="Foot pounds"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>0</Begin>
				<End>2397</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>2397</Begin>
				<End>2450</End>
			</ColorZone>
			<GraduationLength>100</GraduationLength>
			<GraduationTextLength>500</GraduationTextLength>
			<RedBlink>
				<Greater>
					<Simvar name="ENG TORQUE:1" unit="Foot pounds"/>
					<Constant>2400</Constant>
				</Greater>
			</RedBlink>
		</Gauge>

		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-10</BeginAngle>
				<EndAngle>160</EndAngle>
				<CursorType>Triangle</CursorType>
				<ValuePos>End</ValuePos>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_IttGauge</ID>
			<Title>ITT</Title>
			<Unit>°C</Unit>
			<Minimum>0</Minimum>
			<Maximum>
				<StateMachine>
					<State id="Start" value="1100">
						<Transition to="Normal">
							<Greater>
								<Simvar name="TURB ENG N1:1" unit="percent"/>
								<Constant>52</Constant>
							</Greater>
						</Transition>
					</State>
					<State id="Normal" value="950">
						<Transition to="Start">
							<Lower>
								<Simvar name="TURB ENG N1:1" unit="percent"/>
								<Constant>10</Constant>
							</Lower>
						</Transition>
					</State>
				</StateMachine>
			</Maximum>
			<Value>
				<Simvar name="TURB ENG1 ITT" unit="celsius"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>100</Begin>
				<End>805</End>
			</ColorZone>
			<ColorZone>
				<Color>yellow</Color>
				<Begin>805</Begin>
				<End>825</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>825</Begin>
				<End>850</End>
			</ColorZone>
			<ColorLine>
				<Color>red</Color>
				<Position>
					<StateMachine>
						<State id="Start" value="1090">
							<Transition to="Normal">
								<Greater>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>52</Constant>
								</Greater>
							</Transition>
						</State>
						<State id="Normal" value="850">
							<Transition to="Start">
								<Lower>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>10</Constant>
								</Lower>
							</Transition>
						</State>
					</StateMachine>
				</Position>
			</ColorLine>

			<RedBlink>
				<Greater>
					<Simvar name="TURB ENG1 ITT" unit="celsius"/>
					<StateMachine>
						<State id="Start" value="1090">
							<Transition to="Normal">
								<Greater>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>52</Constant>
								</Greater>
							</Transition>
						</State>
						<State id="Normal" value="850">
							<Transition to="Start">
								<Lower>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>10</Constant>
								</Lower>
							</Transition>
						</State>
					</StateMachine>
				</Greater>
			</RedBlink>
			<GraduationLength>50</GraduationLength>
		</Gauge>

		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-10</BeginAngle>
				<EndAngle>160</EndAngle>
				<CursorType>Triangle</CursorType>
				<ValuePos>End</ValuePos>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_NgGauge</ID>
			<Title>NG</Title>
			<Unit>% RPM</Unit>
			<Minimum>10</Minimum>
			<Maximum>110</Maximum>
			<Value>
				<Simvar name="TURB ENG N2:1" unit="percent"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>51</Begin>
				<End>101.6</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>101.6</Begin>
				<End>104</End>
			</ColorZone>
			<GraduationLength>10</GraduationLength>
			<RedBlink>
				<Greater>
					<Simvar name="TURB ENG N2:1" unit="percent"/>
					<Constant>101.6</Constant>
				</Greater>
			</RedBlink>
		</Gauge>

		<Text>
			<Style>
				<Margins>
					<Top>20</Top>
				</Margins>
			</Style>
			<Center>---------------------------------</Center>
		</Text>

		<Text>
			<Style>
				<Margins>
					<Bottom>10</Bottom>
				</Margins>
			</Style>
			<Left>Prop RPM</Left>
			<Right id="Turbo_RPMGauge">
				<Content>
					<ToFixed precision="0">
						<Simvar name="PROP RPM:1" unit="rpm"/>
					</ToFixed>
				</Content>
				<Color>
					<If>
						<Condition>
							<Greater>
								<Simvar name="PROP RPM:1" unit="rpm"/>
								<Constant>1600</Constant>
							</Greater>
						</Condition>
						<Then>
							<If>
								<Condition>
									<Greater>
										<Simvar name="PROP RPM:1" unit="rpm"/>
										<Constant>1900</Constant>
									</Greater>
								</Condition>
								<Then>
									<Constant>red</Constant>
								</Then>
								<Else>
									<Constant>green</Constant>
								</Else>
							</If>
						</Then>
						<Else>
							<Constant>white</Constant>
						</Else>
					</If>
				</Color>
			</Right>
		</Text>

		<Gauge>
			<Type>Horizontal</Type>
			<Style>
				<ValuePos>End</ValuePos>
			</Style>
			<ID>Turbo_OilPressGauge</ID>
			<Title>Oil</Title>
			<Unit>PSI</Unit>
			<Minimum>0</Minimum>
			<Maximum>120</Maximum>
			<Value>
				<Simvar name="GENERAL ENG OIL PRESSURE:1" unit="psi"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>85</Begin>
				<End>105</End>
			</ColorZone>
			<ColorZone>
				<Color>yellow</Color>
				<Begin>40</Begin>
				<End>85</End>
			</ColorZone>
			<ColorLine>
				<Color>red</Color>
				<Position>40</Position>
			</ColorLine>
			<ColorLine>
				<Color>red</Color>
				<Position>105</Position>
			</ColorLine>
			<BeginText></BeginText>
			<EndText></EndText>
			<RedBlink>
				<Or>
					<Greater>
						<Simvar name="GENERAL ENG OIL PRESSURE:1" unit="psi"/>
						<Constant>101.6</Constant>
					</Greater>
					<Lower>
						<Simvar name="GENERAL ENG OIL PRESSURE:1" unit="psi"/>
						<Constant>40</Constant>
					</Lower>
				</Or>
			</RedBlink>
		</Gauge>

		<Gauge>
			<Type>Horizontal</Type>
			<Style>
				<ValuePos>End</ValuePos>
			</Style>
			<ID>Turbo_OilTempGauge</ID>
			<Title>Oil</Title>
			<Unit>°C</Unit>
			<Minimum>-50</Minimum>
			<Maximum>120</Maximum>
			<Value>
				<Simvar name="GENERAL ENG OIL TEMPERATURE:1" unit="celsius"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>10</Begin>
				<End>100</End>
			</ColorZone>
			<ColorZone>
				<Color>yellow</Color>
				<Begin>-40</Begin>
				<End>10</End>
			</ColorZone>
			<ColorZone>
				<Color>yellow</Color>
				<Begin>100</Begin>
				<End>105</End>
			</ColorZone>
			<ColorLine>
				<Color>red</Color>
				<Position>-41</Position>
			</ColorLine>
			<ColorLine>
				<Color>red</Color>
				<Position>105</Position>
			</ColorLine>
			<BeginText></BeginText>
			<EndText></EndText>
			<RedBlink>
				<Or>
					<Greater>
						<Simvar name="GENERAL ENG OIL TEMPERATURE:1" unit="celsius"/>
						<Constant>105</Constant>
					</Greater>
					<Lower>
						<Simvar name="GENERAL ENG OIL TEMPERATURE:1" unit="celsius"/>
						<Constant>-41</Constant>
					</Lower>
				</Or>
			</RedBlink>
		</Gauge>

		<Text>
			<Style>
				<Margins>
					<Top>10</Top>
				</Margins>
			</Style>
			<Left>L</Left>
			<Center>Fuel Qty</Center>
			<Right>R</Right>
		</Text>

		<Gauge>
			<Type>DoubleVertical</Type>
			<ID>Turbo_FuelGauge</ID>
			<Title></Title>
			<Unit>LBS</Unit>
			<Minimum>0</Minimum>
			<Maximum>1100</Maximum>
			<Style>
				<Height>70</Height>
			</Style>
			<Value>
				<Multiply>
					<Simvar name="FUEL LEFT QUANTITY" unit="gallons"/>
					<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
				</Multiply>
			</Value>
			<Value2>
				<Multiply>
					<Simvar name="FUEL RIGHT QUANTITY" unit="gallons"/>
					<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
				</Multiply>
			</Value2>
			<ColorLine>
				<Color>red</Color>
				<Position>0</Position>
			</ColorLine>
			<ColorZone>
				<Color>red</Color>
				<Begin>0</Begin>
				<End>25</End>
			</ColorZone>
			<GraduationLength text="True">200</GraduationLength>
			<EndText></EndText>
		</Gauge>

		<Text>
			<Style>
				<Margins>
					<Top>10</Top>
				</Margins>
			</Style>
			<Left>FFlow PPH</Left>
			<Right id="FuelFlow">
				<ToFixed precision="0">
					<Simvar name="ENG FUEL FLOW PPH:1" unit="Pounds per hour"/>
				</ToFixed>
			</Right>
		</Text>
	</EnginePage>

	<SystemPage>
		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-50</BeginAngle>
				<EndAngle>190</EndAngle>
				<ValuePos>End</ValuePos>
				<CursorType>Triangle</CursorType>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_TorqueGauge</ID>
			<Title>FT-LB</Title>
			<Unit>x100</Unit>
			<Minimum>0</Minimum>
			<Maximum>3000</Maximum>
			<Value>
				<Simvar name="TURB ENG FREE TURBINE TORQUE:1" unit="Foot pounds"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>0</Begin>
				<End>2397</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>2397</Begin>
				<End>2450</End>
			</ColorZone>
			<GraduationLength>100</GraduationLength>
			<GraduationTextLength>500</GraduationTextLength>
			<RedBlink>
				<Greater>
					<Simvar name="ENG TORQUE:1" unit="Foot pounds"/>
					<Constant>2400</Constant>
				</Greater>
			</RedBlink>
		</Gauge>

		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-10</BeginAngle>
				<EndAngle>160</EndAngle>
				<CursorType>Triangle</CursorType>
				<ValuePos>End</ValuePos>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_IttGauge</ID>
			<Title>ITT</Title>
			<Unit>°C</Unit>
			<Minimum>0</Minimum>
			<Maximum>
				<StateMachine>
					<State id="Start" value="1100">
						<Transition to="Normal">
							<Greater>
								<Simvar name="TURB ENG N1:1" unit="percent"/>
								<Constant>52</Constant>
							</Greater>
						</Transition>
					</State>
					<State id="Normal" value="950">
						<Transition to="Start">
							<Lower>
								<Simvar name="TURB ENG N1:1" unit="percent"/>
								<Constant>10</Constant>
							</Lower>
						</Transition>
					</State>
				</StateMachine>
			</Maximum>
			<Value>
				<Simvar name="TURB ENG1 ITT" unit="celsius"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>100</Begin>
				<End>805</End>
			</ColorZone>
			<ColorZone>
				<Color>yellow</Color>
				<Begin>805</Begin>
				<End>825</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>825</Begin>
				<End>850</End>
			</ColorZone>
			<ColorLine>
				<Color>red</Color>
				<Position>
					<StateMachine>
						<State id="Start" value="1090">
							<Transition to="Normal">
								<Greater>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>52</Constant>
								</Greater>
							</Transition>
						</State>
						<State id="Normal" value="850">
							<Transition to="Start">
								<Lower>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>10</Constant>
								</Lower>
							</Transition>
						</State>
					</StateMachine>
				</Position>
			</ColorLine>
			<RedBlink>
				<Greater>
					<Simvar name="TURB ENG1 ITT" unit="celsius"/>
					<StateMachine>
						<State id="Start" value="1090">
							<Transition to="Normal">
								<Greater>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>52</Constant>
								</Greater>
							</Transition>
						</State>
						<State id="Normal" value="850">
							<Transition to="Start">
								<Lower>
									<Simvar name="TURB ENG N1:1" unit="percent"/>
									<Constant>10</Constant>
								</Lower>
							</Transition>
						</State>
					</StateMachine>
				</Greater>
			</RedBlink>
			<GraduationLength>50</GraduationLength>
		</Gauge>

		<Gauge>
			<Type>Circular</Type>
			<Style>
				<BeginAngle>-10</BeginAngle>
				<EndAngle>160</EndAngle>
				<CursorType>Triangle</CursorType>
				<ValuePos>End</ValuePos>
				<SizePercent>90</SizePercent>
			</Style>
			<BeginText></BeginText>
			<EndText></EndText>
			<ID>Turbo_NgGauge</ID>
			<Title>NG</Title>
			<Unit>% RPM</Unit>
			<Minimum>10</Minimum>
			<Maximum>110</Maximum>
			<Value>
				<Simvar name="TURB ENG N2:1" unit="percent"/>
			</Value>
			<ColorZone>
				<Color>green</Color>
				<Begin>51</Begin>
				<End>101.6</End>
			</ColorZone>
			<ColorZone>
				<Color>red</Color>
				<Begin>101.6</Begin>
				<End>104</End>
			</ColorZone>
			<GraduationLength>10</GraduationLength>
			<RedBlink>
				<Greater>
					<Simvar name="TURB ENG N2:1" unit="percent"/>
					<Constant>101.6</Constant>
				</Greater>
			</RedBlink>
		</Gauge>

		<Text>
			<Center>---------------------------------</Center>
		</Text>

		<Text>
			<Left>Prop RPM</Left>
			<Right>
				<Content>
					<ToFixed precision="0">
						<Simvar name="PROP RPM:1" unit="rpm"/>
					</ToFixed>
				</Content>
				<Color>
					<If>
						<Condition>
							<Greater>
								<Simvar name="PROP RPM:1" unit="rpm"/>
								<Constant>1600</Constant>
							</Greater>
						</Condition>
						<Then>
							<If>
								<Condition>
									<Greater>
										<Simvar name="PROP RPM:1" unit="rpm"/>
										<Constant>1900</Constant>
									</Greater>
								</Condition>
								<Then>
									<Constant>red</Constant>
								</Then>
								<Else>
									<Constant>green</Constant>
								</Else>
							</If>
						</Then>
						<Else>
							<Constant>white</Constant>
						</Else>
					</If>
				</Color>
			</Right>
		</Text>

		<Text>
			<Left>------------</Left>
			<Center>Fuel</Center>
			<Right>------------</Right>
		</Text>

		<Text>
			<Left>Qty L LBS</Left>
			<Right>
				<ToFixed precision="0">
					<Multiply>
						<Simvar name="FUEL LEFT QUANTITY" unit="gallons"/>
						<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
					</Multiply>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>Qty R LBS</Left>
			<Right>
				<ToFixed precision="0">
					<Multiply>
						<Simvar name="FUEL RIGHT QUANTITY" unit="gallons"/>
						<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
					</Multiply>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>FFlow PPH</Left>
			<Right>
				<ToFixed precision="0">
					<Simvar name="ENG FUEL FLOW PPH:1" unit="Pounds per hour"/>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>--</Left>
			<Center>Fuel Totalizer</Center>
			<Right>--</Right>
		</Text>

		<Text>
			<Left>LB Rem</Left>
			<Right>
				<ToFixed precision="0">
					<Multiply>
						<Simvar name="L:WT1000_Fuel_GalRemaining" unit="gallon"/>
						<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
					</Multiply>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>LB Used</Left>
			<Right>
				<ToFixed precision="0">
					<Multiply>
						<Simvar name="L:WT1000_Fuel_GalBurned" unit="gallon"/>
						<Simvar name="FUEL WEIGHT PER GALLON" unit="pounds"/>
					</Multiply>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>------</Left>
			<Center>Electrical</Center>
			<Right>-----</Right>
		</Text>

		<Text>
			<Left>Gen Amps</Left>
			<Right>
				<ToFixed precision="0">
					<Simvar name="ELECTRICAL GENALT BUS AMPS:1" unit="amps"/>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>Alt Amps</Left>
			<Right>
				<ToFixed precision="0">
					<Simvar name="ELECTRICAL GENALT BUS AMPS:1" unit="amps"/>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>Bat Amps</Left>
			<Right>
				<ToFixed precision="0">
					<Simvar name="ELECTRICAL BATTERY BUS AMPS" unit="amps"/>
				</ToFixed>
			</Right>
		</Text>

		<Text>
			<Left>Bus VoltsS</Left>
			<Right>
				<ToFixed precision="1">
					<Simvar name="ELECTRICAL MAIN BUS VOLTAGE" unit="volts"/>
				</ToFixed>
			</Right>
		</Text>
		<SystemPage/>
	</EngineDisplay>
`;
