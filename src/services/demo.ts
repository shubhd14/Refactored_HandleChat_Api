namespace ChatModule {
  export class ChatHandler {
    // private fields
    private userPrompt: string;
    private sessionId: string;
    private customModel: string | number;
    private action: number;
    private crmaction: any;
    private tittle: string = "";
    private responseJson: any;
    private baseMessageKey: string = "";
    private guidelinesKey: string = "";
    private functionResult: any;
    private prompts: string[] = [];
    private cleaned: string = "";
    private geminiResponse: string = "";
    private maxRetries: number = 3;
    private attempt: number = 0;
    private success: boolean = false;
    private currentDatestring: string;

    constructor() {
      this.userPrompt = "";
      this.sessionId = "";
      this.customModel = 0;
      this.action = 0;
      this.currentDatestring = getCurrentDateTime();
    }

    public async handleChatRequest(req: ChatApi, res: Response): Promise<void> {
      this.userPrompt = req.body.prompt;
      this.sessionId = req.body.chatId;
      this.customModel = req.body.model || 0;
      this.action = req.body.action || 0;

      try {
        if (this.customModel == 0) {
          this.baseMessageKey = "SYSTEM_MESSAGE_BASE";
          this.guidelinesKey = "SYSTEM_MESSAGE_GUIDELINES";
        } else if (this.customModel == 1) {
          this.baseMessageKey = "SYSTEM_MESSAGE_BASE_TRACE";
          this.guidelinesKey = "SYSTEM_MESSAGE_GUIDELINES_TRACE";
        } else if (this.customModel == 2) {
          try {
            this.responseJson = await callGeminiAI(
              this.userPrompt,
              this.sessionId
            );
            const parsedResponse = JSON.parse(this.responseJson);
            res.status(200).send(parsedResponse ?? "");
            return;
          } catch (error) {
            console.error("Error in customModel 2 block:", error);
            res
              .status(500)
              .json({
                error:
                  "Something went wrong while processing GeminiAI response.",
              });
          }
        }

        const systemMessageBuilder = new SystemMessageBuilder(
          this.baseMessageKey,
          this.guidelinesKey
        );

        while (this.attempt < this.maxRetries && !this.success) {
          try {
            this.geminiResponse = await geminiService.interactWithGemini(
              this.userPrompt,
              systemMessageBuilder,
              this.sessionId
            );
            this.success = true;
          } catch (error) {
            this.attempt++;
            console.error(`Attempt ${this.attempt} failed:`, error);
            if (this.attempt >= this.maxRetries) {
              throw new Error(
                `Failed to interact with Gemini after ${this.maxRetries} attempts.`
              );
            }
            await new Promise((res) =>
              setTimeout(res, 1000 * this.attempt)
            ); // Backoff before retry
          }
        }

        this.tittle = await generateTitle(this.userPrompt);
        console.log("Generated title:", this.tittle);
        console.log("Gemini Response:", this.geminiResponse);

        if (this.action == 1 && this.customModel == 0) {
          console.log("one");
          let copiedMessages = sessionHistories.get(this.sessionId) || [];
          const storedValue = await DefaultValues();
          const Masterjsonnmsg = cons.Masterjsonmsg || "";
          const Finalmasterjsonmsg = Masterjsonnmsg + storedValue;
          copiedMessages[0] = {
            role: "user",
            parts: [{ text: Finalmasterjsonmsg }],
          };
          this.crmaction = await Crmaction(copiedMessages, this.customModel);
          copiedMessages.splice(-2, 2);
          this.responseJson = formatResponse({
            title: this.functionResult?.title || this.tittle,
            response: cons.showdetailsForcustomisation,
            next_user_responses: [],
            crm_action: this.crmaction,
            tracing_filters: null,
          });
          copiedMessages[0] = {
            role: "user",
            parts: [{ text: cons.customisationchatsystemmsg }],
          };
        } else if (this.action == 1 && this.customModel == 1) {
          let copiedMessages = sessionHistories.get(this.sessionId) || [];
          copiedMessages[0] = {
            role: "user",
            parts: [{ text: cons.plugincrmactionmsg + this.currentDatestring }],
          };
          copiedMessages.splice(-2, 2);
          this.crmaction = await Crmaction(copiedMessages, this.customModel);
          console.log("parsedObject", this.crmaction);
          this.responseJson = formatResponse({
            title: this.tittle,
            response: cons.showdetailsForLogs,
            next_user_responses: [],
            crm_action: null,
            tracing_filters: this.crmaction,
          });
          copiedMessages[0] = {
            role: "user",
            parts: [{ text: cons.pluginchatmsg }],
          };
        } else if (this.action == 0) {
          let copiedMessages = sessionHistories.get(this.sessionId) || [];
          if (!copiedMessages) {
            console.error(
              "Session history not found for session:",
              this.sessionId
            );
            res
              .status(400)
              .json({ error: "Session history not found." });
            return;
          }

          if (this.customModel == 0) {
            copiedMessages[0] = {
              role: "user",
              parts: [{ text: cons.convertationfollowupprompts }],
            };
          } else {
            copiedMessages[0] = {
              role: "user",
              parts: [{ text: cons.pluginfollowupprompts }],
            };
          }

          this.prompts = await followupprompts(copiedMessages);
          copiedMessages.splice(-2, 2);
          this.responseJson = formatResponse({
            title: this.functionResult?.title || this.tittle,
            response: this.geminiResponse,
            next_user_responses: this.prompts || [],
            crm_action: null,
            tracing_filters: null,
          });

          if (this.customModel == 0) {
            copiedMessages[0] = {
              role: "user",
              parts: [{ text: cons.customisationchatsystemmsg }],
            };
          } else {
            copiedMessages[0] = {
              role: "user",
              parts: [{ text: cons.pluginchatmsg }],
            };
          }
        }

        res.status(200).send(this.responseJson ?? "");
      } catch (error) {
        const responseJson = formatResponse({
          title: "Retry Request",
          response: "Something went wrong, please try again.",
          next_user_responses: ["Retry this " + this.userPrompt],
          crm_action: null,
          tracing_filters: null,
        });
        res.status(200).send(responseJson);
      }
    }
  }
}

export = ChatModule;